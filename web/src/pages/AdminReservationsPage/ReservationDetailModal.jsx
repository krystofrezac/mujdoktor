import { Modal, Button, Alert } from "react-bootstrap";
import { formatDate } from "../../helpers/formatDate";
import { formatTime } from "../../helpers/formatTime";
import { addMinutes } from "../../helpers/addMinutes";
import { useRespondToReservationMutation } from "../../hooks/requests/useRespondToReservationMutation";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import { GET_RESERVATIONS_FOR_WEEK_QUERY_KEY } from "../../hooks/requests/useGetReservationsForWeekQuery";
import { useCanBeReservationAcceptedQuery } from "../../hooks/requests/useCanReservetionBeAcceptedQuery";
import { DynamicContent } from "../../components/DynamicContent";

export const ReservationDetailModal = ({
	reservation,
	weeksFirstDate,
	onClose,
}) => {
	const isWithoutResponse = reservation?.status === "withoutResponse";

	const canBeAcceptedQuery = useCanBeReservationAcceptedQuery(
		{ id: reservation?.id },
		{ enabled: !!reservation && isWithoutResponse },
	);
	const { mutate: respond, isPending: isRespondPending } =
		useRespondToReservationMutation();
	const { enqueueSnackbar } = useSnackbar();
	const queryClient = useQueryClient();

	const handleRespond = (response) => {
		respond(
			{ id: reservation.id, response },
			{
				onSuccess: () => {
					enqueueSnackbar({
						variant: "success",
						message: "Successfullly responded to reservation",
					});
					queryClient.invalidateQueries({
						queryKey: GET_RESERVATIONS_FOR_WEEK_QUERY_KEY(
							weeksFirstDate.toISOString(),
						),
					});
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to respond to reservation",
					});
				},
			},
		);
	};
	const handleDecline = () => handleRespond("declined");
	const handleAccept = () => handleRespond("accepted");

	const show = !!reservation;

	const fromFormatted = formatTime(new Date(reservation?.startDatetime));
	const toFormatted = formatTime(
		addMinutes(
			new Date(reservation?.startDatetime),
			reservation?.procedure.duration,
		),
	);
	const timeRange = `${fromFormatted} - ${toFormatted}`;

	const renderFooter = (canBeAccepted) => {
		return (
			<>
				{!canBeAccepted && (
					<Alert>
						Cannot be accepted because it conflicts with another reservation or
						it's outside opening hours
					</Alert>
				)}
				<Button
					variant="danger"
					disabled={isRespondPending}
					onClick={handleDecline}
				>
					Decline
				</Button>
				<Button
					variant="success"
					disabled={isRespondPending || !canBeAccepted}
					onClick={handleAccept}
				>
					Accept
				</Button>
			</>
		);
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Reservation detail</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div>Date: {formatDate(new Date(reservation?.startDatetime))}</div>
				<div>Time: {timeRange}</div>
				<div>Procedure: {reservation?.procedure.name}</div>
				<div>
					Patient's email:{" "}
					<a href={`mailto:${reservation?.patientEmail}`}>
						{reservation?.patientEmail}
					</a>
				</div>
				<div>
					Patient's phone number:{" "}
					<a href={`tel:${reservation?.patientPhoneNumber}`}>
						{reservation?.patientPhoneNumber}
					</a>
				</div>
			</Modal.Body>
			{isWithoutResponse && (
				<Modal.Footer>
					<DynamicContent
						{...canBeAcceptedQuery}
						renderContent={renderFooter}
					/>
				</Modal.Footer>
			)}
		</Modal>
	);
};
