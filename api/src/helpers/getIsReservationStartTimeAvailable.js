import { getAvailableSlots } from "./getAvailableSlots.js";

export const getIsReservationStartTimeAvailable = ({
	startTime,
	openingHours,
	procedure,
	reservationsForDayLinkedWithProcedures,
}) => {
	const availableStartTimes = getAvailableSlots({
		openingHours,
		procedure,
		reservationsForDayLinkedWithProcedures,
	}).map((slot) => ({ ...slot, to: slot.to - procedure.duration }));

	const isStartTimeAvailable = availableStartTimes.some(
		(availableStartTime) =>
			startTime >= availableStartTime.from &&
			startTime <= availableStartTime.to,
	);
	return isStartTimeAvailable;
};
