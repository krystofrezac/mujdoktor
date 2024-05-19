import { sendError } from "../helpers/sendError.js";
import { sendInputValidationError } from "../helpers/sendInputValidationError.js";
import {
	Day,
	listOpeningHours,
	updateOpeningHour,
} from "../stores/openingHoursStore.js";
import { z } from "zod";

export const listOpeningHoursHandler = async (_req, res) => {
	const listResult = await listOpeningHours();
	if (!listResult.success) {
		return sendError(res, 500, listResult);
	}
	res.json(listResult.openingHoursList);
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
		.refine((data) => data.from <= data.to, "`to` must be later than `from`");

	const params = paramsSchema.safeParse(req.params);
	if (!params.success) {
		return sendInputValidationError(res, "params", params.error);
	}

	const body = bodySchema.safeParse(req.body);
	if (!body.success) {
		return sendInputValidationError(res, "body", body.error);
	}

	const updateResult = await updateOpeningHour({
		day: params.data.day,
		...body.data,
	});
	if (!updateResult.success) {
		return sendError(res, 500, updateResult);
	}
	res.status(200).send();
};
