import { Link } from "react-router-dom";
import { DynamicContent } from "../components/DynamicContent";
import { ReservationLayout } from "../components/ReservationLayout";
import { useListProcedursQuery } from "../hooks/requests/useListProceduresQuery";
import { Row, Col, Card, Button } from "react-bootstrap";

export const ReservationProcedurePage = () => {
	const query = useListProcedursQuery();

	const renderContent = (procedures) => {
		const mappedProcedures = procedures.map((procedure) => (
			<Col sm={5} md={4} lg={3} key={procedure.id}>
				<Card className="mb-2">
					<Card.Body>
						<Card.Title>{procedure.name}</Card.Title>
						<Card.Subtitle>{procedure.duration} min</Card.Subtitle>
						<div className="mt-2 d-flex justify-content-end">
							<Link
								to={{
									pathname: "/reservation/date",
									search: `procedureId=${procedure.id}`,
								}}
							>
								<Button>Pick</Button>
							</Link>
						</div>
					</Card.Body>
				</Card>
			</Col>
		));
		return (
			<Row className="d-flex justify-content-center">{mappedProcedures}</Row>
		);
	};

	return (
		<ReservationLayout activeStep={0}>
			<DynamicContent {...query} renderContent={renderContent} />
		</ReservationLayout>
	);
};
