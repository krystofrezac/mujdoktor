import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { Row, Col } from "react-bootstrap";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { TimelinePicker } from "./TimelinePicker";
import { ReservationLayout } from "../../components/ReservationLayout";
import { useListAvailableSlotsQuery } from "../../hooks/requests/useListAvailableSlotsQuery";
import { DynamicContent } from "../../components/DynamicContent";
import { formatApiDate } from "../../helpers/formatApiDate";

export const ReservationDatePage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [selectedDate, setSelectedDate] = useState(new Date());

	const procedureId = searchParams.get("procedureId");

	const slotsQuery = useListAvailableSlotsQuery({
		date: formatApiDate(selectedDate),
		procedureId,
	});

	if (!procedureId) {
		return <Navigate to="/reservation/procedure" replace />;
	}

	const handleDateSelect = (date) => {
		if (date) setSelectedDate(date);
	};

	const handleSubmit = (reservationStart) => {
		const datetime = new Date(
			`${formatApiDate(selectedDate)} ${reservationStart}`,
		).toISOString();
		navigate({
			pathname: "/reservation/summary",
			search: `procedureId=${procedureId}&datetime=${datetime}`,
		});
	};

	const handleGoToPreviousStep = () => {
		navigate("/reservation/procedure");
	};

	const renderSlotsContent = ({ slots, procedure }) => {
		return (
			<TimelinePicker
				slots={slots}
				procedureDuration={procedure.duration}
				onSubmit={handleSubmit}
			/>
		);
	};

	return (
		<ReservationLayout
			activeStep={1}
			onGoToPreviousStep={handleGoToPreviousStep}
		>
			<Row>
				<Col md={6} className="d-flex justify-content-center">
					<DayPicker
						mode="single"
						selected={selectedDate}
						onSelect={handleDateSelect}
					/>
				</Col>
				<Col md={6}>
					<DynamicContent
						{...slotsQuery}
						renderContent={renderSlotsContent}
						disableEmptyCheck
					/>
				</Col>
			</Row>
		</ReservationLayout>
	);
};
