import fs from "fs/promises";
import path from "path";
import { generatedId } from "../helpers/generateId.js";
import { getProcedure } from "./proceduresStore.js";

export const ReservationStatus = {
	accepted: "accepted",
	declined: "declined",
	withoutResponse: "withoutResponse",
};

const STORAGE_DIR = path.join(import.meta.dirname, "storage/reservations");

const getFilePath = (id) => path.join(STORAGE_DIR, `${id}.json`);

export const getReservation = async (id) => {
	try {
		const rawData = await fs.readFile(
			path.join(STORAGE_DIR, `${id}.json`),
			"utf8",
		);
		const parsed = JSON.parse(rawData);
		return {
			success: true,
			reservation: { ...parsed, startDatetime: new Date(parsed.startDatetime) },
		};
	} catch (err) {
		if (err.code === "ENOENT") {
			return {
				success: false,
				code: "ReservationNotFound",
				message: "Reservation not found",
			};
		}
		return {
			success: false,
			code: "FailedToGetReservation",
			message: err.message,
		};
	}
};

export const listReservations = async () => {
	try {
		const files = await fs.readdir(STORAGE_DIR);
		const reservationsPromises = files.map(async (file) => {
			const rawData = await fs.readFile(path.join(STORAGE_DIR, file), "utf8");
			const parsed = JSON.parse(rawData);
			return {
				...parsed,
				startDatetime: new Date(parsed.startDatetime),
			};
		});

		const reservations = await Promise.all(reservationsPromises);

		return { success: true, reservations };
	} catch (err) {
		return {
			success: false,
			code: "FailedToListReservations",
			message: err.message,
		};
	}
};

export const findReservationsByDate = async ({ date }) => {
	try {
		const listResult = await listReservations();
		if (!listResult.success) {
			return listResult;
		}

		const reservationsForDate = listResult.reservations.filter(
			(reservation) =>
				reservation.startDatetime.getFullYear() === date.getFullYear() &&
				reservation.startDatetime.getMonth() === date.getMonth() &&
				reservation.startDatetime.getDate() === date.getDate(),
		);

		return { success: true, reservations: reservationsForDate };
	} catch (err) {
		return {
			success: false,
			code: "FailedToCreateReservation",
			message: err.message,
		};
	}
};

export const createReservation = async ({
	startDatetime,
	procedureId,
	patientEmail,
	patientPhoneNumber,
	status,
}) => {
	try {
		const id = generatedId();
		const reservation = {
			id,
			startDatetime,
			procedureId,
			patientEmail,
			patientPhoneNumber,
			status,
		};

		await fs.writeFile(getFilePath(id), JSON.stringify(reservation), "utf8");

		return { success: true, reservation };
	} catch (err) {
		return {
			success: false,
			code: "FailedToCreateReservation",
			message: err.message,
		};
	}
};

export const updateReservation = async ({
	id,
	startDatetime,
	procedureId,
	patientEmail,
	patientPhoneNumber,
	status,
}) => {
	try {
		const reservation = {
			id,
			startDatetime,
			procedureId,
			patientEmail,
			patientPhoneNumber,
			status,
		};
		await fs.writeFile(getFilePath(id), JSON.stringify(reservation), "utf8");
		return {
			success: true,
			reservation,
		};
	} catch (err) {
		return {
			success: false,
			code: "FailedToUpdateReservation",
			message: err.message,
		};
	}
};

export const linkReservationsWithProcedures = async (reservations) => {
	const listWithProcedureResultsPromises = reservations.map(
		async (reservation) => {
			const procedureResult = await getProcedure(reservation.procedureId);
			if (!procedureResult.success) {
				return procedureResult;
			}

			return {
				...reservation,
				procedure: procedureResult.procedure,
			};
		},
	);
	const listWithProcedureResults = await Promise.all(
		listWithProcedureResultsPromises,
	);
	const maybeError = listWithProcedureResults.find(
		(item) => item.success === false,
	);
	if (maybeError) return maybeError;

	return { success: true, linkedWithProcedures: listWithProcedureResults };
};
