import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const ReservationFinishPage = () => {
	return (
		<div className="d-flex flex-column align-items-center">
			<h3 className="text-center">
				Reservation was send to the doctor's office. Please wait for
				confirmation email.
			</h3>
			<Link className="mt-4" to="/">
				<Button>Go to main page</Button>
			</Link>
		</div>
	);
};
