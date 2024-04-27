import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { minutesFromMidnightToTime } from "./helpers/minutesFromMidnightToTime";
import { timeToMinutesFromMidnight } from "./helpers/timeToMinutesFromMidnight";
import { DAYS_TRANSLATION } from "./constants";

export const OpeningHoursEditModal = ({
	show,
	defaultValues,
	dayIndex,
	onClose,
}) => {
	const [values, setValues] = useState({ from: "00:00", to: "00:00" });
	const [validated, setValidated] = useState(false);
	const [globalError, setGlobalError] = useState(undefined);

	useEffect(() => {
		if (defaultValues)
			setValues({
				from: minutesFromMidnightToTime(defaultValues.from),
				to: minutesFromMidnightToTime(defaultValues.to),
			});
	}, [defaultValues]);

	const handleFromChange = (e) => {
		setValues((prev) => ({
			...prev,
			from: e.target.value,
		}));
	};
	const handleToChange = (e) => {
		setValues((prev) => ({
			...prev,
			to: e.target.value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const valid = e.currentTarget.checkValidity();
		setValidated(true);

		if (!valid) return;

		const fromTime = timeToMinutesFromMidnight(values.from);
		const toTime = timeToMinutesFromMidnight(values.to);
		if (toTime < fromTime) {
			setGlobalError("To must be after From");
			return;
		}
		setGlobalError(undefined);
	};

	const day = DAYS_TRANSLATION[dayIndex];

	const maybeGlobalErrorAlert = globalError && (
		<Alert variant="danger">{globalError}</Alert>
	);

	return (
		<Modal show={show} onHide={onClose}>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Update opening hours for {day}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{maybeGlobalErrorAlert}
					<Form.Group controlId="validationCustom02">
						<Form.Label>From</Form.Label>
						<Form.Control
							type="time"
							value={values.from}
							required
							onChange={handleFromChange}
						/>
					</Form.Group>
					<Form.Group className="mt-3">
						<Form.Label>To</Form.Label>
						<Form.Control
							type="time"
							value={values.to}
							required
							onChange={handleToChange}
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit">Save</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
