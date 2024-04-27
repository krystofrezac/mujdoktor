import { Navbar, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export const LayoutNav = ({ rightElement }) => {
	return (
		<Navbar bg="primary" data-bs-theme="dark">
			<Container>
				<Link to="/">
					<Button size="lg">Můj doktor</Button>
				</Link>
				{rightElement}
			</Container>
		</Navbar>
	);
};
