import {
	Day,
	listOpeningHours,
	updateOpeningHour,
} from "../stores/openingHoursStore.js";
import { z } from "zod";

export const listOpeningHoursHandler = async (_req, res) => {
	res.json(await listOpeningHours());
};

export const updateOpeningHourHandler = async (req, res) => {
	const paramsSchema = z.object({
		day: z.coerce.number().pipe(z.nativeEnum(Day)),
	});
	const bodySchema = z
		.object({
			/** minutes from midnight */
			from: z
				.number()
				.min(0)
				.max(24 * 60),
			/** minutes from midnight */
			to: z
				.number()
				.min(0)
				.max(24 * 60),
		})
		.refine((data) => data.from < data.to, "`to` must be later than `from`");

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return res.status(400).json(params.error);
	}

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return res.status(400).json(body.error);
	}

	await updateOpeningHour({ day: params.data.day, ...body.data });
	res.statusCode = 201;
	res.status(201).send();
};
