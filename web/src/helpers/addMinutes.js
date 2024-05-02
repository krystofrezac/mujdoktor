export const addMinutes = (date, minutes) =>
	new Date(date.getTime() + minutes * 60 * 1_000);
