import {
	listOpeningHoursHandler,
	updateOpeningHourHandler,
} from "./handlers/openingHoursHandler.js";
import {
	createProcedureHandler,
	deleteProcedureHandler,
	listProceduresHandler,
	updateProcedureHandler,
	listAvailableSlotsForProcedureHandler,
} from "./handlers/proceduresHandler.js";

export const setupRouter = (app) => {
	app.get("/opening-hours", listOpeningHoursHandler);
	app.put("/opening-hours/:day", updateOpeningHourHandler);

	app.get("/procedures", listProceduresHandler);
	app.post("/procedure", createProcedureHandler);
	app.put("/procedure/:id", updateProcedureHandler);
	app.delete("/procedure/:id", deleteProcedureHandler);
	app.get(
		"/procedure/:procedureId/available-slots/:date",
		listAvailableSlotsForProcedureHandler,
	);
};
