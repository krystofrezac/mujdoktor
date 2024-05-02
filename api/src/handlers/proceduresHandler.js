import { idSchema } from "../helpers/idSchema.js";
import { sendError } from "../helpers/sendError.js";
import { sortByDate } from "../helpers/sortByDate.js";
import {
	createProcedure,
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

	const notDeletedProcedures = listProceduresResult.procedures.filter(
		(procedure) => !procedure.deleted,
	);

	const sortedProcedures = sortByDate(
		notDeletedProcedures,
		(procedure) => procedure.createdAt,
	);
	res.json(sortedProcedures);
};

export const getProcedureHandler = async (req, res) => {
	const paramsSchema = z.object({
		id: idSchema,
	});
	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const procedureResult = await getProcedure(params.data.id);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}

	if (procedureResult.procedure.deleted) {
		return sendError(res, 404, {
			code: "ProcedureNotFound",
			message: "Procedure not found",
		});
	}

	return res.json(procedureResult.procedure);
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

	const procedureResult = await getProcedure(params.data.id);
	if (!procedureResult.success) {
		if (procedureResult.code === "ProcedureNotFound") {
			return sendError(res, 404, procedureResult);
		}
		return sendError(res, 500, procedureResult);
	}

	// Cannot hard delete because of relation to reservation
	const updateResult = await updateProcedure({
		...procedureResult.procedure,
		deleted: true,
	});
	if (!updateResult.success) {
		return sendError(res, 500, updateResult);
	}

	return res.status(200).send();
};

const getMaybeNameUniquenessError = (procedures, name) => {
	const notDeletedProcedures = procedures.filter(
		(procedure) => !procedure.deleted,
	);
	const doesProcedureWithNameExists = notDeletedProcedures.some(
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
