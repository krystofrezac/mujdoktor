import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";

export const useUpdateOpeningHoursMutation = () => {
	return useMutation({
		mutationFn: async ({ day, from, to }) => {
			await fetch(env("API_BASE_URL") + "/opening-hours/" + day, {
				method: "put",
				body: JSON.stringify({ from, to }),
				headers: {
					"Content-Type": "application/json",
				},
			});
		},
	});
};
