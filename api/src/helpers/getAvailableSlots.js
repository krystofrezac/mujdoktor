import { ReservationStatus } from "../stores/reservationsStore.js";
import { getMinutesFromMidnightFromDate } from "./getMinutesFromMidnightFromDate.js";

export const getAvailableSlots = ({
	openingHours,
	procedure,
	reservationsForDayLinkedWithProcedures,
}) => {
	const availableSlots = removeApprovedReservations({
		slots: [openingHours],
		reservations: reservationsForDayLinkedWithProcedures,
	});

	const longEnoughSlots = availableSlots.reduce((acc, slot) => {
		const slotDuration = slot.to - slot.from;
		if (slotDuration >= procedure.duration) {
			acc.push(slot);
		}
		return acc;
	}, []);

	return longEnoughSlots;
};

const removeApprovedReservations = ({ slots, reservations }) => {
	const firstReservation = reservations[0];
	if (!firstReservation) return slots;
	const reservationsTail = reservations.slice(1);

	if (firstReservation.status !== ReservationStatus.accepted) {
		return removeApprovedReservations({
			slots,
			reservations: reservationsTail,
		});
	}

	const reservationStart = getMinutesFromMidnightFromDate(
		firstReservation.startDatetime,
	);
	const reservationEnd = reservationStart + firstReservation.procedure.duration;

	const slotsWithoutReservation = slots.flatMap((slot) => {
		const isOverlapping =
			slot.from <= reservationStart && slot.to >= reservationEnd;
		if (!isOverlapping) return slot;

		return [
			{ ...slot, to: reservationStart },
			{ ...slot, from: reservationEnd },
		];
	});

	return removeApprovedReservations({
		slots: slotsWithoutReservation,
		reservations: reservationsTail,
	});
};
