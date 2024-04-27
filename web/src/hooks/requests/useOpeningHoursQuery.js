import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";

export const useOpeningHoursQuery = () => {
	return useQuery({
		queryKey: ["opening-hours"],
		queryFn: () =>
			fetch(env("API_BASE_URL") + "/opening-hours").then((res) => res.json()),
	});
};
