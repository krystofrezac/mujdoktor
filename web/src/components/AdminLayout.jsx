import { Link, Outlet } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { PathTabs } from "./PathTabs";
import { LayoutNav } from "./LayoutNav";

const TABS = [
	{
		to: "/admin/opening-hours",
		label: "Opening hours",
	},
	{
		to: "/admin/procedures",
		label: "Procedures",
	},
];

export const AdminLayout = () => {
	return (
		<>
			<LayoutNav
				rightElement={
					<Link to="/">
						<Button>Logout</Button>
					</Link>
				}
			/>
			<Container className="pt-4">
				<PathTabs tabs={TABS} />
				<div className="pt-4">
					<Outlet />
				</div>
			</Container>
		</>
	);
};
