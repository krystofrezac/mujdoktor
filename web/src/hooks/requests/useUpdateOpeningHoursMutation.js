import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useUpdateOpeningHoursMutation = () => {
	return useMutation({
		mutationFn: ({ day, from, to }) =>
			wrapFetch(
				fetch(env("API_BASE_URL") + "/opening-hours/" + day, {
					method: "put",
					body: JSON.stringify({ from, to }),
					headers: {
						"Content-Type": "application/json",
					},
				}),
			),
	});
};
