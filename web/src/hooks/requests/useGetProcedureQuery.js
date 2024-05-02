import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const GET_PROCEDURE_QUERY_KEY = (id) => ["procedures", id];

export const useGetProcedureQuery = ({ id }) => {
	return useQuery({
		queryKey: GET_PROCEDURE_QUERY_KEY(id),
		queryFn: () => wrapFetch(fetch(env("API_BASE_URL") + "/procedure/" + id)),
	});
};
