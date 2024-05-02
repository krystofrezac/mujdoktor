import { Stepper } from "./Stepper";
import { Button, Container } from "react-bootstrap";

const STEPS = ["Pick procedure", "Pick date", "Summary"];

export const ReservationLayout = ({
	children,
	activeStep,
	onGoToPreviousStep,
}) => {
	return (
		<>
			{onGoToPreviousStep && (
				<div className="fixed-bottom mb-2">
					<Container>
						<Button variant="secondary" onClick={onGoToPreviousStep}>
							← Go to previous step
						</Button>
					</Container>
				</div>
			)}
			<Stepper steps={STEPS} activeStep={activeStep} />
			<div className="mt-4">{children}</div>
		</>
	);
};
