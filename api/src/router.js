import {
	listOpeningHoursHandler,
	updateOpeningHourHandler,
} from "./handlers/openingHoursHandler.js";
import {
	createProcedureHandler,
	deleteProcedureHandler,
	listProceduresHandler,
	updateProcedureHandler,
	getProcedureHandler,
} from "./handlers/proceduresHandler.js";
import {
	canReservationBeAcceptedHandler,
	createReservationHandler,
	getReservationsForWeek,
	listAvailableSlotsForProcedureHandler,
	respondToReservation,
} from "./handlers/reservationsHandler.js";

export const setupRouter = (app) => {
	app.get("/opening-hours", listOpeningHoursHandler);
	app.put("/opening-hours/:day", updateOpeningHourHandler);

	app.get("/procedures", listProceduresHandler);
	app.get("/procedure/:id", getProcedureHandler);
	app.post("/procedure", createProcedureHandler);
	app.put("/procedure/:id", updateProcedureHandler);
	app.delete("/procedure/:id", deleteProcedureHandler);

	app.get(
		"/procedure/:procedureId/available-slots/:date",
		listAvailableSlotsForProcedureHandler,
	);
	app.post("/reservation", createReservationHandler);
	app.get("/reservations-week/:firstDate", getReservationsForWeek);
	app.put("/reservation/:id/respond", respondToReservation);
	app.get("/reservation/:id/can-be-accepted", canReservationBeAcceptedHandler);
};
