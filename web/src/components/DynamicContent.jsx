import { Spinner } from "react-bootstrap";

export const DynamicContent = ({
	isPending,
	error,
	data,
	renderContent,
	disableEmptyCheck,
}) => {
	if (isPending) {
		return (
			<div className="d-flex justify-content-center">
				<Spinner variant="primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="d-flex justify-content-center">
				<h3>Unexpected error</h3>
			</div>
		);
	}

	if (!data || (data.length === 0 && !disableEmptyCheck)) {
		return (
			<div className="d-flex justify-content-center">
				<h3>No data</h3>
			</div>
		);
	}

	return renderContent(data);
};
