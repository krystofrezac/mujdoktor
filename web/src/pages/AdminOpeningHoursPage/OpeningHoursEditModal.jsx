import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { minutesFromMidnightToTime } from "./helpers/minutesFromMidnightToTime";
import { timeToMinutesFromMidnight } from "./helpers/timeToMinutesFromMidnight";
import { DAYS_TRANSLATION } from "./constants";
import { useUpdateOpeningHoursMutation } from "../../hooks/requests/useUpdateOpeningHoursMutation";
import { useQueryClient } from "@tanstack/react-query";
import { LIST_OPENING_HOURS_QUERY_KEY } from "../../hooks/requests/useListOpeningHoursQuery";
import { useSnackbar } from "notistack";

export const OpeningHoursEditModal = ({
	show,
	defaultValues,
	day,
	onClose,
}) => {
	const queryClient = useQueryClient();
	const { mutate: updateOpeningHours, isPending: isUpdatePending } =
		useUpdateOpeningHoursMutation();
	const { enqueueSnackbar } = useSnackbar();

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

	const handleClose = () => {
		setValidated(false);
		setGlobalError(undefined);
		onClose();
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const valid = e.currentTarget.checkValidity();
		if (!valid) {
			setValidated(true);
			return;
		}

		const fromTime = timeToMinutesFromMidnight(values.from);
		const toTime = timeToMinutesFromMidnight(values.to);
		if (toTime < fromTime) {
			setGlobalError("The closing time must after the opening time");
			return;
		}
		setGlobalError(undefined);

		updateOpeningHours(
			{ from: fromTime, to: toTime, day },
			{
				onSuccess: () => {
					enqueueSnackbar({
						message: "Opening hours updated successfully",
						variant: "success",
					});
					queryClient.invalidateQueries({
						queryKey: LIST_OPENING_HOURS_QUERY_KEY,
					});
					handleClose();
				},
				onError: () => {
					enqueueSnackbar({
						message: "Opening hours update failed",
						variant: "error",
					});
				},
			},
		);
	};

	const dayTranslation = DAYS_TRANSLATION[day];

	const maybeGlobalErrorAlert = globalError && (
		<Alert variant="danger">{globalError}</Alert>
	);

	const submitText = isUpdatePending ? "Saving..." : "Save";

	return (
		<Modal show={show} onHide={handleClose}>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Update opening hours for {dayTranslation}</Modal.Title>
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
					<Button type="submit" disabled={isUpdatePending}>
						{submitText}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
