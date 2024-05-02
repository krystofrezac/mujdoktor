import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useCreateProcedureMutation = () => {
	return useMutation({
		mutationFn: ({ name, duration }) =>
			wrapFetch(
				fetch(env("API_BASE_URL") + "/procedure", {
					method: "post",
					body: JSON.stringify({ name, duration }),
					headers: {
						"Content-Type": "application/json",
					},
				}),
			),
	});
};
