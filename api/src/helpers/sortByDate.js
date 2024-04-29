export const sortByDate = (data, getField) =>
	[...data].sort((a, b) => {
		const aTime = new Date(getField(a)).getTime();
		const bTime = new Date(getField(b)).getTime();

		return aTime - bTime;
	});
