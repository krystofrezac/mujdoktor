import { idSchema } from "../helpers/idSchema.js";
import { sendError } from "../helpers/sendError.js";
import { sortByDate } from "../helpers/sortByDate.js";
import { getOpeningHours } from "../stores/openingHoursStore.js";
import {
	createProcedure,
	deleteProcedure,
	getProcedure,
	listProcedures,
	updateProcedure,
} from "../stores/proceduresStore.js";
import { z } from "zod";

const nameSchema = z.string().min(1);
const durationSchema = z
	.number()
	.min(1)
	.max(24 * 60);

export const listProceduresHandler = async (_req, res) => {
	const listProceduresResult = await listProcedures();
	if (!listProceduresResult.success) {
		return sendError(res, 500, listProceduresResult);
	}

	const sortedProcedures = sortByDate(
		listProceduresResult.procedures,
		(procedure) => procedure.createdAt,
	);
	res.json(sortedProcedures);
};

export const createProcedureHandler = async (req, res) => {
	const bodySchema = z.object({
		name: nameSchema,
		duration: durationSchema,
	});

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json(body);
	}

	const listResult = await listProcedures();
	if (!listResult.success) {
		return sendError(res, 500, listResult);
	}

	const nameError = getMaybeNameUniquenessError(
		listResult.procedures,
		body.data.name,
	);
	if (nameError) {
		return sendError(res, 400, nameError);
	}

	const createResult = await createProcedure(body.data);
	if (!createResult.success) {
		return sendError(res, 500, createResult);
	}

	res.status(201).json(createResult.procedure);
};

export const updateProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		id: idSchema,
	});
	const bodySchema = z.object({
		name: nameSchema,
		duration: durationSchema,
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json(body.error);
	}

	const currentResult = await getProcedure(params.data.id);
	if (!currentResult.success) {
		if (currentResult.code === "ProcedureNotFound") {
			return sendError(res, 404, currentResult);
		}
		return sendError(res, 500, currentResult);
	}

	const listResult = await listProcedures();
	if (!listResult.success) {
		return sendError(res, 500, listResult);
	}

	const proceduresWithoutCurrent = listResult.procedures.filter(
		(procedure) => procedure.id !== params.data.id,
	);
	const nameError = getMaybeNameUniquenessError(
		proceduresWithoutCurrent,
		body.data.name,
	);
	if (nameError) {
		return sendError(res, 400, nameError);
	}

	const result = await updateProcedure({
		...params.data,
		...body.data,
		createdAt: currentResult.procedure.createdAt,
	});
	if (!result.success) {
		return sendError(res, 500, result);
	}

	return res.status(200).json(result.procedure);
};

export const deleteProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		id: idSchema,
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const result = await deleteProcedure(params.data.id);
	if (!result.success) {
		if (result.code === "ProcedureNotFound") {
			return sendError(res, 404, result);
		}
		return sendError(res, 500, result);
	}

	return res.status(200).send();
};

export const listAvailableSlotsForProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		/** For some reason return previous day (possibly something with time zones). Which is good because we than don't need to transform USA day number to czech one (Sunday vs Monday) */
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

	// TODO: "substract" already booked times
	const availableSlots = [openingHours];

	const longEnoughSlots = availableSlots.reduce((acc, slot) => {
		const slotDuration = slot.to - slot.from;
		if (slotDuration >= procedure.duration) {
			acc.push(slot);
		}
		return acc;
	}, []);

	res.json({ procedure, slots: longEnoughSlots });
};

const getMaybeNameUniquenessError = (procedures, name) => {
	const doesProcedureWithNameExists = procedures.some(
		(procedure) => procedure.name === name,
	);
	if (doesProcedureWithNameExists) {
		return {
			success: false,
			code: "ProcedureNameAlreadyExists",
			message: "Procedure with given name already exists",
		};
	}

	return undefined;
};
