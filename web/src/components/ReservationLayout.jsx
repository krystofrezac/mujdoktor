import { Stepper } from "./Stepper";

const STEPS = ["Pick procedure", "Pick date", "Summary"];

export const ReservationLayout = ({ children, step }) => {
	return (
		<>
			<Stepper steps={STEPS} activeStep={0} />
			<div className="mt-4">{children}</div>
		</>
	);
};
