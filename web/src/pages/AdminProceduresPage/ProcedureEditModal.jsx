import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { useUpdateProcedureMutation } from "../../hooks/requests/useUpdateProcedureMutation";
import { LIST_PROCEDURES_QUERY_KEY } from "../../hooks/requests/useListProceduresQuery";

export const ProcedureEditModal = ({ defaultValues, onClose }) => {
	const queryClient = useQueryClient();
	const { mutate: updateProcedure, isPending: isUpdatePending } =
		useUpdateProcedureMutation();
	const { enqueueSnackbar } = useSnackbar();

	const [values, setValues] = useState({ from: "00:00", to: "00:00" });
	const [validated, setValidated] = useState(false);
	const [globalError, setGlobalError] = useState(undefined);

	useEffect(() => {
		if (defaultValues)
			setValues(defaultValues);
	}, [defaultValues]);

	const handleNameChange = (e) => {
		setValues((prev) => ({
			...prev,
			name: e.target.value,
		}));
	};
	const handleDurationChange = (e) => {
		setValues((prev) => ({
			...prev,
			duration: e.target.value,
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

		updateProcedure(
			{ id: defaultValues.id, name: values.name, duration: values.duration },
			{
				onSuccess: () => {
					enqueueSnackbar({
						message: "Procedure updated successfully",
						variant: "success",
					});
					queryClient.invalidateQueries({
						queryKey: LIST_PROCEDURES_QUERY_KEY,
					});
					handleClose();
				},
				onError: (error) => {
					if (error.data.code === 'ProcedureNameAlreadyExists') {
						return setGlobalError("The name of the procedure is already used. Choose different one")
					}

					enqueueSnackbar({
						message: "Procedure update failed",
						variant: "error",
					});
				},
			},
		);
	};


	const maybeGlobalErrorAlert = globalError && (
		<Alert variant="danger">{globalError}</Alert>
	);

	const show = !!defaultValues
	const submitText = isUpdatePending ? "Saving..." : "Save";

	return (
		<Modal show={show} onHide={handleClose}>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Update procedure</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{maybeGlobalErrorAlert}
					<Form.Group controlId="validationCustom02">
						<Form.Label>Name</Form.Label>
						<Form.Control
							value={values.name}
							required
							minLength={1}
							onChange={handleNameChange}
						/>
						<Form.Control.Feedback type="invalid">
							The name must be at least 1 character long
						</Form.Control.Feedback>
					</Form.Group>
					<Form.Group className="mt-3">
						<Form.Label>Duration in minutes</Form.Label>
						<Form.Control
							type="number"
							value={values.duration}
							required
							min={1}
							max={24 * 60}
							onChange={handleDurationChange}
						/>
						<Form.Control.Feedback type="invalid">
							The duration must be at least 1 minute long
						</Form.Control.Feedback>
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
