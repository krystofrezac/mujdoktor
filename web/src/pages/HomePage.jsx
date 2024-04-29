import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const HomePage = () => {
	return (
		<div className="d-flex justify-content-center">
			<Link to="/reservation/procedure">
				<Button>Create reservation</Button>
			</Link>
		</div>
	);
};
