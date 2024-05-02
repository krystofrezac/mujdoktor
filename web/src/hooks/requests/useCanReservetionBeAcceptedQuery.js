import { useQuery } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const CAN_BE_RESERVATION_ACCEPTED_QUERY_KEY = (id) => [
	"canBeReservationAccepted",
	id,
];

export const useCanBeReservationAcceptedQuery = ({ id }, options) => {
	return useQuery({
		...options,
		queryKey: CAN_BE_RESERVATION_ACCEPTED_QUERY_KEY(id),
		queryFn: () =>
			wrapFetch(
				fetch(env("API_BASE_URL") + "/reservation/" + id + "/can-be-accepted"),
			),
	});
};
