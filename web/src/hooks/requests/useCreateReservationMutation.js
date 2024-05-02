import { useMutation } from "@tanstack/react-query";
import env from "@beam-australia/react-env";
import { wrapFetch } from "../../helpers/wrapFetch";

export const useCreateReservationMutation = () => {
	return useMutation({
		mutationFn: ({
			procedureId,
			reservationStartDatetime,
			patientEmail,
			patientPhoneNumber,
		}) =>
			wrapFetch(
				fetch(env("API_BASE_URL") + "/reservation", {
					method: "post",
					body: JSON.stringify({
						procedureId,
						reservationStartDatetime,
						patientEmail,
						patientPhoneNumber,
					}),
					headers: {
						"Content-Type": "application/json",
					},
				}),
			),
	});
};
