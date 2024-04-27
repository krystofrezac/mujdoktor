import {
	createProcedure,
	deleteProcedure,
	getProcedures,
	updateProcedure,
} from "../stores/proceduresStore.js";
import { z } from "zod";

const nameSchema = z.string().min(1);
const durationSchema = z
	.number()
	.min(1)
	.max(24 * 60);

export const getProceduresHandler = (_req, res) => {
	res.json(getProcedures());
};

export const createProcedureHandler = (req, res) => {
	const bodySchema = z.object({
		name: nameSchema,
		duration: durationSchema,
	});

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json(body);
	}

	const procedure = createProcedure(body.data);
	res.status(201).json(procedure);
};

export const updateProcedureHandler = (req, res) => {
	const paramsSchema = z.object({
		id: z.coerce.number(),
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

	const result = updateProcedure({ ...params.data, ...body.data });
	if (!result.success) {
		return res.status(404).send("Not found");
	}

	return res.status(200).json(result.procedure);
};

export const deleteProcedureHandler = (req, res) => {
	const paramsSchema = z.object({
		id: z.coerce.number(),
	});

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const result = deleteProcedure(params.data.id);
	if (!result.success) {
		return res.status(404).send("Not found");
	}

	return res.status(200).send();
};
