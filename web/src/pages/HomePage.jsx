import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const HomePage = () => {
	return (
		<div className="d-flex flex-column align-items-center">
			<h1>Doctor Arnostřep Šílený</h1>
			<h2>Consectetur adipiscing elit. Donec vitae dui nec orci!</h2>
			<Link className="mt-2" to="/reservation/procedure">
				<Button size="lg">Create reservation</Button>
			</Link>
		</div>
	);
};
