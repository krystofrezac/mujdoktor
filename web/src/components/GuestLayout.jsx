import { Link, Outlet } from "react-router-dom";
import { Navbar, Container, Button } from "react-bootstrap";
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
			<Outlet />
		</>
	);
};
