import fs from "fs/promises";
import path from "path";
import { generatedId } from "../helpers/generateId.js";

const STORAGE_DIR = path.join(import.meta.dirname, "storage/procedures");

const getFilePath = (id) => path.join(STORAGE_DIR, `${id}.json`);

export const getProcedure = async (id) => {
	try {
		const rawData = await fs.readFile(
			path.join(STORAGE_DIR, `${id}.json`),
			"utf8",
		);
		return { success: true, procedure: JSON.parse(rawData) };
	} catch (err) {
		if (err.code === "ENOENT") {
			return {
				success: false,
				code: "ProcedureNotFound",
				message: "Procedure not found",
			};
		}
		return {
			success: false,
			code: "FailedToGetProcedure",
			message: err.message,
		};
	}
};

export const listProcedures = async () => {
	try {
		const files = await fs.readdir(STORAGE_DIR);
		const proceduresPromises = files.map(async (file) => {
			const rawData = await fs.readFile(path.join(STORAGE_DIR, file), "utf8");
			return JSON.parse(rawData);
		});

		const procedures = await Promise.all(proceduresPromises);

		return { success: true, procedures };
	} catch (err) {
		return {
			success: false,
			code: "FailedToListProcedures",
			message: err.message,
		};
	}
};

export const createProcedure = async ({ name, duration }) => {
	try {
		const listResult = await listProcedures();
		if (!listResult.success) {
			return listResult;
		}

		const id = generatedId();
		const procedure = { id, createdAt: new Date(), name, duration };

		await fs.writeFile(getFilePath(id), JSON.stringify(procedure), "utf8");

		return { success: true, procedure };
	} catch (err) {
		return {
			success: false,
			code: "FailedToCreateProcedure",
			message: err.message,
		};
	}
};

export const updateProcedure = async ({ id, name, duration, createdAt }) => {
	try {
		const procedure = { id, name, duration, createdAt };
		await fs.writeFile(getFilePath(id), JSON.stringify(procedure), "utf8");
		return {
			success: true,
			procedure,
		};
	} catch (err) {
		return {
			success: false,
			code: "FailedToUpdateProcedure",
			message: err.message,
		};
	}
};

// TODO: Cannot delete because of relation to reservation
export const deleteProcedure = async (id) => {
	try {
		await fs.unlink(getFilePath(id));

		return {
			success: true,
		};
	} catch (err) {
		if (err.code === "ENOENT") {
			return {
				success: false,
				code: "ProcedureNotFound",
				message: "Procedure not found",
			};
		}
		return {
			success: false,
			code: "FailedToDeleteProcedure",
			message: err.message,
		};
	}
};
