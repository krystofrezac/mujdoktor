import { useState } from "react";
import { DynamicContent } from "../../components/DynamicContent";
import { Card, Stack, Button } from "react-bootstrap";
import { OpeningHoursEditModal } from "./OpeningHoursEditModal";
import { minutesFromMidnightToTime } from "./helpers/minutesFromMidnightToTime";
import { DAYS_TRANSLATION } from "./constants";
import { useListOpeningHoursQuery } from "../../hooks/requests/useListOpeningHoursQuery";

export const AdminOpeningHoursPage = () => {
	const query = useListOpeningHoursQuery();

	const [dayToEdit, setDayToEdit] = useState(undefined);

	const handleEditModalClose = () => {
		setDayToEdit(undefined);
	};

	const renderContent = (days) => {
		const mappedDays = days.map((openingHours, index) => {
			const handleEdit = () => {
				setDayToEdit({ ...openingHours, day: index });
			};

			const title = DAYS_TRANSLATION[index];
			const fromFormatted = minutesFromMidnightToTime(openingHours.from);
			const toFormatted = minutesFromMidnightToTime(openingHours.to);

			return (
				<Card key={index}>
					<Card.Body>
						<Card.Title>{title}</Card.Title>
						<Card.Text>
							{fromFormatted}-{toFormatted}
						</Card.Text>
						<Button variant="primary" onClick={handleEdit}>
							Edit
						</Button>
					</Card.Body>
				</Card>
			);
		});
		return <Stack gap={2}>{mappedDays}</Stack>;
	};

	return (
		<>
			<OpeningHoursEditModal
				show={!!dayToEdit}
				defaultValues={dayToEdit}
				day={dayToEdit?.day}
				onClose={handleEditModalClose}
			/>
			<DynamicContent {...query} renderContent={renderContent} />
		</>
	);
};
