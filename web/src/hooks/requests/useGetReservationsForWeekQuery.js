import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const GET_RESERVATIONS_FOR_WEEK_QUERY_KEY = (firstDate) => {
	return ["reservationsForWeek", firstDate];
};

export const useGetReservationsForWeekQuery = ({ firstDate }) => {
	return useQuery({
		queryKey: GET_RESERVATIONS_FOR_WEEK_QUERY_KEY(firstDate),
		queryFn: () =>
			wrapFetch(fetch(env("API_BASE_URL") + "/reservations-week/" + firstDate)),
	});
};
