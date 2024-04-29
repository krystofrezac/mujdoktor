import { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { LIST_PROCEDURES_QUERY_KEY } from "../../hooks/requests/useListProceduresQuery";
import { ProcedureFormFields } from "./ProcedureFormFields";
import { useCreateProcedureMutation } from "../../hooks/requests/useCreateProcedureMutation";

const DEFAULT_VALUES = { name: "", duration: 30 };

export const ProcedureCreateModal = ({ show, onClose }) => {
	const queryClient = useQueryClient();
	const { mutate: createProcedure, isPending: isCreatePending } =
		useCreateProcedureMutation();
	const { enqueueSnackbar } = useSnackbar();

	const [values, setValues] = useState(DEFAULT_VALUES);
	const [validated, setValidated] = useState(false);
	const [globalError, setGlobalError] = useState(undefined);

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
		setValues(DEFAULT_VALUES);
		onClose();
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const valid = e.currentTarget.checkValidity();
		if (!valid) {
			setValidated(true);
			return;
		}

		createProcedure(
			{ name: values.name, duration: +values.duration },
			{
				onSuccess: () => {
					enqueueSnackbar({
						message: "Procedure created successfully",
						variant: "success",
					});
					queryClient.invalidateQueries({
						queryKey: LIST_PROCEDURES_QUERY_KEY,
					});
					handleClose();
				},
				onError: (error) => {
					if (error.data.code === "ProcedureNameAlreadyExists") {
						return setGlobalError(
							"The name of the procedure is already used. Choose different one",
						);
					}

					enqueueSnackbar({
						message: "Procedure creation failed",
						variant: "error",
					});
				},
			},
		);
	};

	const maybeGlobalErrorAlert = globalError && (
		<Alert variant="danger">{globalError}</Alert>
	);

	const submitText = isCreatePending ? "Saving..." : "Save";

	return (
		<Modal show={show} onHide={handleClose}>
			<Form noValidate validated={validated} onSubmit={handleSubmit}>
				<Modal.Header closeButton>
					<Modal.Title>Create procedure</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{maybeGlobalErrorAlert}
					<ProcedureFormFields
						values={values}
						onNameChange={handleNameChange}
						onDurationChange={handleDurationChange}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button type="submit" disabled={isCreatePending}>
						{submitText}
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};
