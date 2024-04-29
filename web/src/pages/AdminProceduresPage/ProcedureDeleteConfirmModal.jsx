import { Modal, Button } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteProcedureMutation } from "../../hooks/requests/useDeleteProcedureMutation";
import { useSnackbar } from "notistack";
import { LIST_PROCEDURES_QUERY_KEY } from "../../hooks/requests/useListProceduresQuery";

export const ProcedureDeleteConfirmModal = ({ id, name, onClose }) => {
	const { mutate: deleteProcedure, isPending: isDeletePending } =
		useDeleteProcedureMutation();
	const queryClient = useQueryClient();
	const { enqueueSnackbar } = useSnackbar();

	const show = !!id;
	const deleteButtonText = isDeletePending ? "Deleteing..." : "Delete";

	const handleDelete = () => {
		deleteProcedure(
			{ id },
			{
				onSuccess: () => {
					enqueueSnackbar({
						message: "Procedure deleted successfully",
						variant: "success",
					});
					queryClient.invalidateQueries({
						queryKey: LIST_PROCEDURES_QUERY_KEY,
					});
					onClose();
				},
				onError: () => {
					enqueueSnackbar({
						message: "Procedure delete failed",
						variant: "error",
					});
				},
			},
		);
	};

	return (
		<Modal show={show} onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Do you really want to delete this procedure?</Modal.Title>
			</Modal.Header>
			<Modal.Body>{name}</Modal.Body>
			<Modal.Footer>
				<Button
					variant="danger"
					disabled={isDeletePending}
					onClick={handleDelete}
				>
					{deleteButtonText}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
