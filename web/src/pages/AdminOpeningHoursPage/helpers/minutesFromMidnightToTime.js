export const minutesFromMidnightToTime = (minutesFromMidnight) => {
	const hours = Math.floor(minutesFromMidnight / 60)
		.toString()
		.padStart(2, "0");
	const minutes = (minutesFromMidnight - hours * 60)
		.toString()
		.padStart(2, "0");

	return `${hours}:${minutes}`;
};
