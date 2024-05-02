import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useRespondToReservationMutation = () => {
	return useMutation({
		mutationFn: ({ id, response }) =>
			wrapFetch(
				fetch(env("API_BASE_URL") + "/reservation/" + id + "/respond", {
					method: "put",
					body: JSON.stringify({
						response,
					}),
					headers: {
						"Content-Type": "application/json",
					},
				}),
			),
	});
};
