export const timeToMinutesFromMidnight = (time) => {
	const match = time.match(/^(\d\d):(\d\d)$/);

	return match[1] * 60 + match[2];
};
