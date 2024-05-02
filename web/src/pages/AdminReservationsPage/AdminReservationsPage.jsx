import { useState } from "react";
import { Row, Col, Card, Stack, Button } from "react-bootstrap";
import { useGetReservationsForWeekQuery } from "../../hooks/requests/useGetReservationsForWeekQuery";
import { DynamicContent } from "../../components/DynamicContent";
import { formatDate } from "../../helpers/formatDate";
import { addDays } from "../../helpers/addDays";
import { formatTime } from "../../helpers/formatTime";
import { addMinutes } from "../../helpers/addMinutes";
import { DAYS_TRANSLATION } from "../../constants/daysTranslation";
import { getPrevSunday } from "./helpers/getPrevSunday";
import { findDeep } from "../../helpers/findDeep";
import { ReservationDetailModal } from "./ReservationDetailModal";

export const AdminReservationsPage = () => {
	const [weeksFirstDate, setWeeksFirstDate] = useState(
		getPrevSunday(new Date()),
	);
	const [detailReservationId, setDetailReservationId] = useState(undefined);

	const reservationsQuery = useGetReservationsForWeekQuery({
		firstDate: weeksFirstDate.toISOString(),
	});

	const handlePrevClick = () => {
		setWeeksFirstDate((prev) => addDays(prev, -7));
	};
	const handleNextClick = () => {
		setWeeksFirstDate((prev) => addDays(prev, 7));
	};

	const handleCloseReservationDetalModal = () => {
		setDetailReservationId(undefined);
	};

	const renderContent = (reservationsByDays) => {
		const detailReservation = findDeep(
			reservationsByDays,
			(reservation) => reservation.id === detailReservationId,
		);

		const mappedDays = reservationsByDays.map((reservations, index) => {
			const date = addDays(weeksFirstDate, index);
			const mappedReservations = reservations.map((reservation) => {
				const handleShowDetail = () => {
					setDetailReservationId(reservation.id);
				};

				const statusToBackgroundClassMap = {
					accepted: "bg-success text-white",
					withoutResponse: "bg-warning",
				};
				const backgroundClass = statusToBackgroundClassMap[reservation.status];

				const statusDescriptionMap = {
					accepted: "Accepted",
					withoutResponse: "Waiting for response",
				};
				const statusDescription = statusDescriptionMap[reservation.status];

				const fromFormatted = formatTime(new Date(reservation.startDatetime));
				const toFormatted = formatTime(
					addMinutes(
						new Date(reservation.startDatetime),
						reservation.procedure.duration,
					),
				);
				const timeRange = `${fromFormatted} - ${toFormatted}`;

				return (
					<Card key={reservation.id}>
						<Card.Header className={backgroundClass}>
							{statusDescription}
						</Card.Header>
						<Card.Body>
							<Card.Title>{timeRange}</Card.Title>
							<Card.Text>{reservation.procedure.name}</Card.Text>
							<Stack direction="horizontal" gap={2}>
								<Button
									className="ms-auto"
									variant="primary"
									onClick={handleShowDetail}
								>
									Detail
								</Button>
							</Stack>
						</Card.Body>
					</Card>
				);
			});

			return (
				<Col key={index}>
					<div className="h5">{DAYS_TRANSLATION[index]}</div>
					<div className="h6">{formatDate(date)}</div>
					<Stack gap={2}>{mappedReservations}</Stack>
				</Col>
			);
		});

		return (
			<>
				<ReservationDetailModal
					reservation={detailReservation}
					weeksFirstDate={weeksFirstDate}
					onClose={handleCloseReservationDetalModal}
				/>
				<Stack direction="horizontal" gap={2}>
					<Button
						className="ms-auto"
						variant="secondary"
						onClick={handlePrevClick}
					>
						❮
					</Button>
					<Button variant="secondary" onClick={handleNextClick}>
						❯
					</Button>
				</Stack>
				<Row className="mt-2">{mappedDays}</Row>
			</>
		);
	};

	return (
		<DynamicContent {...reservationsQuery} renderContent={renderContent} />
	);
};
