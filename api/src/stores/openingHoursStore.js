import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(import.meta.dirname, "storage/openingHours");

export const Day = {
	sunday: 0,
	monday: 1,
	tuesday: 2,
	wednesday: 3,
	thursday: 4,
	friday: 5,
	saturday: 6,
};

const DEFAULT_HOURS = {
	from: 8 * 60,
	to: 16 * 60,
};

const getFilePath = (day) => path.join(STORAGE_DIR, `${day}.json`);

export const getOpeningHours = async (day) => {
	try {
		const rawData = await fs.readFile(getFilePath(day), "utf8");
		const parsed = JSON.parse(rawData);
		return { success: true, openingHours: parsed };
	} catch (err) {
		if (err.code === "ENOENT") {
			return { success: true, openingHours: DEFAULT_HOURS };
		}
		return {
			success: false,
			code: "FailedToGetOpeningHours",
			message: err.message,
		};
	}
};

export const listOpeningHours = async () => {
	try {
		const mappedPromises = Object.values(Day).map(getOpeningHours);
		const resultList = await Promise.all(mappedPromises);
		if (!resultList.every((openingHours) => openingHours.success)) {
			return { success: false, code: "FailedToGetOpeningHours" };
		}
		const openingHoursList = resultList.map((result) => result.openingHours);

		return { success: true, openingHoursList };
	} catch (err) {
		return {
			success: false,
			code: "FailedToGetOpeningHours",
			message: err.message,
		};
	}
};

export const updateOpeningHour = async ({ day, from, to }) => {
	try {
		await fs.writeFile(getFilePath(day), JSON.stringify({ from, to }), "utf8");
		return { success: true };
	} catch {
		return {
			success: false,
			code: "FailedToUpdateOpeningHours",
			message: err.message,
		};
	}
};
