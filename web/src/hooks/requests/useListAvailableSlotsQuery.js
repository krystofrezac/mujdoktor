import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const LIST_AVAILABLE_SLOTS_QUERY_KEY = (params) => [
	"availableSlots",
	params,
];

export const useListAvailableSlotsQuery = ({ date, procedureId }) => {
	return useQuery({
		queryKey: LIST_AVAILABLE_SLOTS_QUERY_KEY({ date, procedureId }),
		queryFn: () =>
			wrapFetch(
				fetch(
					env("API_BASE_URL") +
						`/procedure/${procedureId}/available-slots/${date}`,
				),
			),
	});
};
