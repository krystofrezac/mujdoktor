import { Modal, Form, Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { minutesFromMidnightToTime } from "../AdminOpeningHoursPage/helpers/minutesFromMidnightToTime";

export const SpecifySlotModal = ({
	slot,
	procedureDuration,
	onClose,
	onSubmit,
}) => {
	const [reservationStart, setReservationStart] = useState("");
	const [validated, setValidated] = useState(false);

	const min = minutesFromMidnightToTime(slot?.from);
	const max = minutesFromMidnightToTime(slot?.to - procedureDuration);

	useEffect(() => {
		if (!slot) return;
		setValidated(false);
		setReservationStart(min);
	}, [slot]);

	const handleReservationStart = (e) => {
		setReservationStart(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const valid = e.currentTarget.checkValidity();
		if (!valid) {
			setValidated(true);
			return;
		}

		onSubmit(reservationStart);
	};

	const show = !!slot;

	return (
		<Modal show={show} onHide={onClose}>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Specify the time</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Label>{`Choose time between ${min} and ${max}`}</Form.Label>
					<Form.Control
						type="time"
						value={reservationStart}
						required
						min={min}
						max={max}
						onChange={handleReservationStart}
					/>
					<Form.Control.Feedback type="invalid">
						{`The time must be between ${min} and ${max}`}
					</Form.Control.Feedback>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit">Confirm</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
