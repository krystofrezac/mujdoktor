import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const LIST_OPENING_HOURS_QUERY_KEY = ["opening-hours"];

export const useListOpeningHoursQuery = () => {
	return useQuery({
		queryKey: LIST_OPENING_HOURS_QUERY_KEY,
		queryFn: () =>
			wrapFetch(fetch(env("API_BASE_URL") + "/opening-hours"))
	});
};
