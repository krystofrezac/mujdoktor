import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(import.meta.dirname, "storage/openingHours");

export const Day = {
	monday: 0,
	tusday: 1,
	wednesday: 2,
	thursday: 3,
	friday: 5,
	saturday: 6,
	sunday: 7,
};

const DEFAULT_HOURS = {
	from: 8 * 60,
	to: 16 * 60,
};

const getFilePath = (day) => path.join(STORAGE_DIR, `${day}.json`);

export const getOpeningHours = async (day) => {
	try {
		const rawData = await fs.readFile(getFilePath(day), "utf8");
		return JSON.parse(rawData);
	} catch (error) {
		if (error.code === "ENOENT") {
			return DEFAULT_HOURS;
		}
		throw new error();
	}
};

export const listOpeningHours = () => {
	const mappedPromises = Object.values(Day).map(getOpeningHours);
	return Promise.all(mappedPromises);
};

export const updateOpeningHour = ({ day, from, to }) => {
	return fs.writeFile(getFilePath(day), JSON.stringify({ from, to }), "utf8");
};
