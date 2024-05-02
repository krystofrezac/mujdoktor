import { addDays } from "../../../helpers/addDays";

export const getPrevSunday = (date) => {
	if (date.getDay() === 0) return date;

	return getPrevSunday(addDays(date, -1));
};
