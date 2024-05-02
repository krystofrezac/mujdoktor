import { z } from "zod";
import { idSchema } from "../helpers/idSchema.js";
import { sendError } from "../helpers/sendError.js";
import { getOpeningHours } from "../stores/openingHoursStore.js";
import { getProcedure } from "../stores/proceduresStore.js";
import { getAvailableSlots } from "../helpers/getAvailableSlots.js";
import {
	ReservationStatus,
	createReservation,
	findReservationsByDate,
	getReservation,
	linkReservationsWithProcedures,
	updateReservation,
} from "../stores/reservationsStore.js";
import { getMinutesFromMidnightFromDate } from "../helpers/getMinutesFromMidnightFromDate.js";
import { sortByDate } from "../helpers/sortByDate.js";
import { addDays } from "../helpers/addDays.js";
import { getIsReservationStartTimeAvailable } from "../helpers/getIsReservationStartTimeAvailable.js";

export const listAvailableSlotsForProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		date: z.coerce.date(),
		procedureId: idSchema,
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const procedureResult = await getProcedure(params.data.procedureId);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}
	const procedure = procedureResult.procedure;

	const timeAvailabilityParamsResult = await getParamsForTimeAvailability({
		procedure,
		startDatetime: params.data.date,
	});
	if (!timeAvailabilityParamsResult.success) {
		return sendError(res, 500, timeAvailabilityParamsResult);
	}

	const availableSlots = getAvailableSlots(timeAvailabilityParamsResult.params);

	res.json({ procedure, slots: availableSlots });
};

export const createReservationHandler = async (req, res) => {
	const bodySchema = z.object({
		procedureId: idSchema,
		reservationStartDatetime: z.coerce.date(),
		patientEmail: z.string().email(),
		patientPhoneNumber: z.string().regex(/[0-9]{9}/),
	});

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return sendError(res, 400, body.error);
	}

	const procedureResult = await getProcedure(body.data.procedureId);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}
	const procedure = procedureResult.procedure;

	const paramsForTimeAvailabilityResult = await getParamsForTimeAvailability({
		procedure,
		startDatetime: body.data.reservationStartDatetime,
	});
	if (!paramsForTimeAvailabilityResult.success) {
		return sendError(res, 500, paramsForTimeAvailabilityResult);
	}
	const paramsForTimeAvailability = paramsForTimeAvailabilityResult.params;

	const isStartTimeAvailable = getIsReservationStartTimeAvailable(
		paramsForTimeAvailability,
	);
	if (!isStartTimeAvailable) {
		return sendError(res, 400, {
			code: "TimeIsNotAvailable",
			message: "Picked time is already booked or it isn't in opening hours",
		});
	}

	const reservationResult = await createReservation({
		startDatetime: body.data.reservationStartDatetime,
		procedureId: body.data.procedureId,
		patientEmail: body.data.patientEmail,
		patientPhoneNumber: body.data.patientPhoneNumber,
		status: ReservationStatus.withoutResponse,
	});
	if (!reservationResult.success) {
		return sendError(res, 500, reservationResult);
	}

	res.status(201).json(reservationResult.reservation);
};

export const getReservationsForWeek = async (req, res) => {
	const paramsSchema = z.object({
		firstDate: z.coerce.date(),
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const reservationsResultsPromises = Array(7)
		.fill(0)
		.map(async (_, index) => {
			const date = addDays(params.data.firstDate, index);
			const reservationsResult = await findReservationsByDate({ date });
			if (!reservationsResult.success) return reservationsResult;

			const reservationsWithoutDeclined =
				reservationsResult.reservations.filter(
					(reservation) => reservation.status !== ReservationStatus.declined,
				);

			const linkedWithProceduresResult = await linkReservationsWithProcedures(
				reservationsWithoutDeclined,
			);
			if (!linkedWithProceduresResult.success) {
				return linkedWithProceduresResult;
			}

			const sorted = sortByDate(
				linkedWithProceduresResult.linkedWithProcedures,
				(reservation) => reservation.startDatetime,
			);

			return { success: true, reservations: sorted };
		});
	const reservationsResults = await Promise.all(reservationsResultsPromises);

	const maybeError = reservationsResults.find(
		(reservationResult) => !reservationResult.success,
	);
	if (maybeError) {
		sendError(res, 500, maybeError);
	}

	const reservations = reservationsResults.map(
		(reservationResult) => reservationResult.reservations,
	);

	res.json(reservations);
};

export const respondToReservation = async (req, res) => {
	const paramsSchema = z.object({
		id: idSchema,
	});
	const bodySchema = z.object({
		response: z.enum([ReservationStatus.accepted, ReservationStatus.declined]),
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(body.error);
	}

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json(body.error);
	}

	const reservationResult = await getReservation(params.data.id);
	if (!reservationResult.success) {
		if (reservationResult.code === "ReservationNotFound") {
			return sendError(res, 404, reservationResult);
		}
		return sendError(res, 500, reservationResult);
	}
	const reservation = reservationResult.reservation;

	if (
		reservationResult.reservation.status !== ReservationStatus.withoutResponse
	) {
		return sendError(res, 400, {
			code: "AlreadyResponded",
			message: "Someone already reponded to the reservation",
		});
	}

	if (reservationResult.reservation.status === ReservationStatus.accepted) {
		// Check collisions
		const procedureResult = await getProcedure(reservation.procedureId);
		if (!procedureResult.success) {
			return sendError(res, 500, procedureResult);
		}
		const procedure = procedureResult.procedure;

		const timeAvailabilityParamsResult = await getParamsForTimeAvailability({
			procedure,
			startDatetime: reservation.startDatetime,
		});
		if (!timeAvailabilityParamsResult.success) {
			return sendError(res, 500, timeAvailabilityParamsResult);
		}

		const isStartTimeAvailable = getIsReservationStartTimeAvailable(
			timeAvailabilityParamsResult.params,
		);
		if (!isStartTimeAvailable) {
			return sendError(res, 400, {
				code: "TimeIsNotAvailable",
				message: "Picked time is already booked or it isn't in opening hours",
			});
		}
	}

	const updateResult = await updateReservation({
		...reservationResult.reservation,
		status: body.data.response,
	});
	if (!updateResult.success) {
		sendError(res, 500, updateResult);
	}

	return res.status(200).send();
};

export const canReservationBeAcceptedHandler = async (req, res) => {
	const paramsSchema = z.object({
		id: idSchema,
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const reservationResult = await getReservation(params.data.id);
	if (!reservationResult.success) {
		if (reservationResult.code === "ReservationNotFound") {
			return sendError(res, 404, reservationResult);
		}
		return sendError(res, 500, reservationResult);
	}
	const reservation = reservationResult.reservation;

	const procedureResult = await getProcedure(reservation.procedureId);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}
	const procedure = procedureResult.procedure;

	const paramsForTimeAvailabilityResult = await getParamsForTimeAvailability({
		procedure,
		startDatetime: reservation.startDatetime,
	});
	if (!paramsForTimeAvailabilityResult.success) {
		return sendError(res, 500, paramsForTimeAvailabilityResult);
	}
	const paramsForTimeAvailability = paramsForTimeAvailabilityResult.params;

	const isStartTimeAvailable = getIsReservationStartTimeAvailable(
		paramsForTimeAvailability,
	);

	res.json(isStartTimeAvailable);
};

const getParamsForTimeAvailability = async ({ procedure, startDatetime }) => {
	const day = startDatetime.getDay();
	const openingHoursResult = await getOpeningHours(day);
	if (!openingHoursResult.success) {
		return openingHoursResult;
	}
	const openingHours = openingHoursResult.openingHours;

	const reservationsResult = await findReservationsByDate({
		date: startDatetime,
	});
	if (!reservationsResult.success) {
		return reservationsResult;
	}
	const reservationsLinkedWithProceduresResult =
		await linkReservationsWithProcedures(reservationsResult.reservations);
	if (!reservationsLinkedWithProceduresResult.success) {
		return reservationsLinkedWithProceduresResult;
	}
	const reservationsForDayLinkedWithProcedures =
		reservationsLinkedWithProceduresResult.linkedWithProcedures;

	const startTime = getMinutesFromMidnightFromDate(startDatetime);

	return {
		success: true,
		params: {
			startTime,
			openingHours,
			procedure,
			reservationsForDayLinkedWithProcedures,
		},
	};
};
