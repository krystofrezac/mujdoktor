import clsx from "clsx";

export const Stepper = ({ steps, activeStep }) => {
	const mappedSteps = steps.map((step, index) => {
		const showLeftLine = index !== 0;
		const showRightLine = index !== steps.length - 1;
		const active = index === activeStep;

		return (
			<div key={index} className="position-relative " style={{ width: 150 }}>
				{showLeftLine && (
					<div
						className="bg-dark position-absolute"
						style={{ left: 0, right: "50%", top: 12.5, height: 1 }}
					/>
				)}
				{showRightLine && (
					<div
						className="bg-dark position-absolute"
						style={{ left: "50%", right: 0, top: 12.5, height: 1 }}
					/>
				)}
				{/* Relative so it is rendered on top of the lines */}
				<div className="position-relative d-flex flex-column align-items-center mh-auto">
					<div
						className={clsx(
							"d-flex align-items-center justify-content-center rounded-circle text-white",
							active ? "bg-primary" : "bg-secondary",
						)}
						style={{ width: 25, height: 25 }}
					>
						{index + 1}
					</div>
					<div>{step}</div>
				</div>
			</div>
		);
	});

	return <div className="d-flex justify-content-center">{mappedSteps}</div>;
};
