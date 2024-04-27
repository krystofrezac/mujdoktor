import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import clsx from "clsx";

export const PathTabs = ({ tabs }) => {
	const location = useLocation();

	const mappedTabs = tabs.map((tab) => {
		const isActive = location.pathname === tab.to;

		return (
			<Nav.Item key={tab.to}>
				<Link className={clsx(["nav-link", isActive && "active"])} to={tab.to}>
					{tab.label}
				</Link>
			</Nav.Item>
		);
	});
	return <Nav variant="tabs">{mappedTabs}</Nav>;
};
