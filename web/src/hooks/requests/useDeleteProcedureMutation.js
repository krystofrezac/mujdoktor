import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useDeleteProcedureMutation = () => {
	return useMutation({
		mutationFn: ({ id }) =>
			wrapFetch(fetch(env("API_BASE_URL") + "/procedure/" + id, {
				method: "delete",
				headers: {
					"Content-Type": "application/json",
				},
			}))
	});
};
