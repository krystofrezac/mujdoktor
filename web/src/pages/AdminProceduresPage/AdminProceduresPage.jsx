import { useState } from "react";
import { DynamicContent } from "../../components/DynamicContent";
import { Card, Stack, Button } from "react-bootstrap";
import { ProcedureEditModal } from "./ProcedureEditModal";
import { useListProcedursQuery } from "../../hooks/requests/useListProceduresQuery";
import { ProcedureDeleteConfirmModal } from "./ProcedureDeleteConfirmModal";
import { ProcedureCreateModal } from "./ProcedureCreateModal";

export const AdminProceduresPage = () => {
	const query = useListProcedursQuery();

	const [procedureIdToEdit, setProcedureIdToEdit] = useState(undefined);
	const [procedureIdToDelete, setProcedureIdToDelete] = useState(undefined);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const handleEditModalClose = () => {
		setProcedureIdToEdit(undefined);
	};

	const handleDeleteModalClose = () => {
		setProcedureIdToDelete(undefined);
	};

	const handleCreateModalOpen = () => setShowCreateModal(true);
	const handleCreateModalClose = () => setShowCreateModal(false);

	const renderContent = (procedures) => {
		const mappedProcedures = procedures.map((procedure) => {
			const handleEditClick = () => {
				setProcedureIdToEdit(procedure.id);
			};
			const handleDeleteClick = () => {
				setProcedureIdToDelete(procedure.id);
			};

			return (
				<Card key={procedure.id}>
					<Card.Body>
						<Card.Title>{procedure.name}</Card.Title>
						<Card.Text>{procedure.duration} min</Card.Text>
						<Stack direction="horizontal" gap={2}>
							<Button
								className="ms-auto"
								variant="primary"
								onClick={handleEditClick}
							>
								Edit
							</Button>
							<Button variant="danger" onClick={handleDeleteClick}>
								Delete
							</Button>
						</Stack>
					</Card.Body>
				</Card>
			);
		});

		const procedureToEdit = procedures.find(
			(procedure) => procedure.id === procedureIdToEdit,
		);
		const procedureToDelete = procedures.find(
			(procedure) => procedure.id === procedureIdToDelete,
		);

		return (
			<>
				<ProcedureEditModal
					defaultValues={procedureToEdit}
					onClose={handleEditModalClose}
				/>
				<ProcedureDeleteConfirmModal
					id={procedureToDelete?.id}
					name={procedureToDelete?.name}
					onClose={handleDeleteModalClose}
				/>
				<Stack gap={2}>{mappedProcedures}</Stack>
			</>
		);
	};

	return (
		<>
			<ProcedureCreateModal
				show={showCreateModal}
				onClose={handleCreateModalClose}
			/>
			<div className="d-flex justify-content-end">
				<Button className="mb-2" onClick={handleCreateModalOpen}>
					Create new
				</Button>
			</div>
			<DynamicContent {...query} renderContent={renderContent} />
		</>
	);
};
