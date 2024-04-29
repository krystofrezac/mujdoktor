import { Form } from "react-bootstrap";

export const ProcedureFormFields = ({
	values,
	onNameChange,
	onDurationChange,
}) => {
	return (
		<>
			<Form.Group controlId="validationCustom02">
				<Form.Label>Name</Form.Label>
				<Form.Control
					value={values.name}
					required
					minLength={1}
					onChange={onNameChange}
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
					onChange={onDurationChange}
				/>
				<Form.Control.Feedback type="invalid">
					The duration must be at least 1 minute long
				</Form.Control.Feedback>
			</Form.Group>
		</>
	);
};
