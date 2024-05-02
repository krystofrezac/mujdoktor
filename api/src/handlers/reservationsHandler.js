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
	linkReservationsWithProcedures,
} from "../stores/reservationsStore.js";
import { getMinutesFromMidnightFromDate } from "../helpers/getMinutesFromMidnightFromDate.js";

export const listAvailableSlotsForProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		date: z.coerce.date(),
		procedureId: idSchema,
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const day = params.data.date.getDay();
	const openingHoursResult = await getOpeningHours(day);
	if (!openingHoursResult.success) {
		return sendError(res, 500, openingHoursResult);
	}
	const openingHours = openingHoursResult.openingHours;

	const procedureResult = await getProcedure(params.data.procedureId);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}
	const procedure = procedureResult.procedure;

	const reservationsResult = await findReservationsByDate({
		date: params.data.date,
	});
	if (!reservationsResult.success) {
		return sendError(res, 500, reservationsResult);
	}
	const reservationsLinkedWithProceduresResult =
		await linkReservationsWithProcedures(reservationsResult.reservations);
	if (!reservationsLinkedWithProceduresResult.success) {
		return sendError(res, 500, reservationsLinkedWithProceduresResult);
	}

	const availableSlots = getAvailableSlots({
		openingHours,
		procedure,
		reservationsForDayLinkedWithProcedures:
			reservationsLinkedWithProceduresResult.linkedWithProcedures,
	});

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

	const day = body.data.reservationStartDatetime.getDay();
	const openingHoursResult = await getOpeningHours(day);
	if (!openingHoursResult.success) {
		return sendError(res, 500, openingHoursResult);
	}
	const openingHours = openingHoursResult.openingHours;

	const procedureResult = await getProcedure(body.data.procedureId);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}
	const procedure = procedureResult.procedure;

	const reservationsResult = await findReservationsByDate({
		date: body.data.reservationStartDatetime,
	});
	if (!reservationsResult.success) {
		return sendError(res, 500, reservationsResult);
	}
	const reservationsLinkedWithProceduresResult =
		await linkReservationsWithProcedures(reservationsResult.reservations);
	if (!reservationsLinkedWithProceduresResult.success) {
		return sendError(res, 500, reservationsLinkedWithProceduresResult);
	}

	const availableStartTimes = getAvailableSlots({
		openingHours,
		procedure,
		reservationsForDayLinkedWithProcedures:
			reservationsLinkedWithProceduresResult.linkedWithProcedures,
	}).map((slot) => ({ ...slot, to: slot.to - procedure.duration }));
	const startTime = getMinutesFromMidnightFromDate(
		body.data.reservationStartDatetime,
	);
	const isStartTimeAvailable = availableStartTimes.some(
		(availableStartTime) =>
			startTime >= availableStartTime.from &&
			startTime <= availableStartTime.to,
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
