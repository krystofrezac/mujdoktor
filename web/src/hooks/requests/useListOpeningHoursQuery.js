import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";

export const LIST_OPENING_HOURS_QUERY_KEY = ["opening-hours"];

export const useListOpeningHoursQuery = () => {
	return useQuery({
		queryKey: LIST_OPENING_HOURS_QUERY_KEY,
		queryFn: () =>
			fetch(env("API_BASE_URL") + "/opening-hours").then((res) => res.json()),
	});
};
