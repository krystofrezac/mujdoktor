import { Link, Outlet } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { LayoutNav } from "./LayoutNav";

export const GuestLayout = () => {
	return (
		<>
			<LayoutNav
				rightElement={
					<Link to="/admin">
						<Button>Administration</Button>
					</Link>
				}
			/>
			<Container className="pt-4">
				<div className="pt-4">
					<Outlet />
				</div>
			</Container>
		</>
	);
};
