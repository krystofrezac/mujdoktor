import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const LIST_PROCEDURES_QUERY_KEY = ["procedures"];

export const useListProcedursQuery = () => {
	return useQuery({
		queryKey: LIST_PROCEDURES_QUERY_KEY,
		queryFn: () =>
			wrapFetch(fetch(env("API_BASE_URL") + "/procedures"))
	});
};
