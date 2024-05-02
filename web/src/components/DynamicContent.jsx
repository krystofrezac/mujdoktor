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
				<span className="fs-3">Unexpected error</span>
			</div>
		);
	}

	if (!data || (data.length === 0 && !disableEmptyCheck)) {
		return (
			<div className="d-flex justify-content-center">
				<span className="fs-3">No data</span>
			</div>
		);
	}

	return renderContent(data);
};
