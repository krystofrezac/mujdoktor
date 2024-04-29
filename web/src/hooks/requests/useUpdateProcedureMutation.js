import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useUpdateProcedureMutation = () => {
	return useMutation({
		mutationFn: ({ id, name, duration }) =>
			wrapFetch(fetch(env("API_BASE_URL") + "/procedure/" + id, {
				method: "put",
				body: JSON.stringify({ name, duration }),
				headers: {
					"Content-Type": "application/json",
				},
			}))
	});
};
