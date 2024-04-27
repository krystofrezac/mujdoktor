import {
	Day,
	getOpeningHours,
	updateOpeningHour,
} from "../stores/openingHoursStore.js";
import { z } from "zod";

export const getOpeningHoursHandler = (_req, res) => {
	res.json(getOpeningHours());
};

export const updateOpeningHourHandler = (req, res) => {
	const paramsSchema = z.object({
		day: z.coerce.number().pipe(z.nativeEnum(Day)),
	});
	const bodySchema = z
		.object({
			/** minutes from midnight */
			from: z
				.number()
				.min(0)
				.max(12 * 60),
			/** minutes from midnight */
			to: z
				.number()
				.min(0)
				.max(12 * 60),
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

	updateOpeningHour({ day: params.data.day, ...body.data });
	res.statusCode = 201;
	res.status(201).send();
};
