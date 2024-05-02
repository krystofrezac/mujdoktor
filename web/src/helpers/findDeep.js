export const findDeep = (data, finder) => {
	for (const item of data) {
		const found = item.find(finder);
		if (found) {
			return found;
		}
	}
	return undefined;
};
