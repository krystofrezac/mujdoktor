import { Navigate, useSearchParams, useNavigate } from "react-router-dom";
import { useGetProcedureQuery } from "../hooks/requests/useGetProcedureQuery";
import { DynamicContent } from "../components/DynamicContent";
import { formatDate } from "../helpers/formatDate";
import { formatTime } from "../helpers/formatTime";
import { ReservationLayout } from "../components/ReservationLayout";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useSnackbar } from "notistack";
import { useCreateReservationMutation } from "../hooks/requests/useCreateReservationMutation";

export const ReservationSummaryPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { mutate: createReservation, isPending: isCreatePending } =
		useCreateReservationMutation();
	const { enqueueSnackbar } = useSnackbar();

	const [values, setValues] = useState({ email: "", phoneNumber: "" });
	const [validated, setValidated] = useState(false);

	const procedureId = searchParams.get("procedureId");
	const datetime = searchParams.get("datetime");

	const procedureQuery = useGetProcedureQuery({ id: procedureId });

	if (!procedureId || !datetime) {
		return <Navigate to="/reservation/procedure" replace />;
	}

	const handleGoToPreviousStep = () => {
		navigate({
			pathname: "/reservation/date",
			search: `procedureId=${procedureId}`,
		});
	};

	const handleEmailChange = (e) => {
		setValues((prev) => ({
			...prev,
			email: e.target.value,
		}));
	};
	const handlePhoneNumberChange = (e) => {
		setValues((prev) => ({
			...prev,
			phoneNumber: e.target.value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const valid = e.currentTarget.checkValidity();
		if (!valid) {
			setValidated(true);
			return;
		}

		createReservation(
			{
				procedureId,
				reservationStartDatetime: datetime,
				patientEmail: values.email,
				patientPhoneNumber: values.phoneNumber.replace(/\s+/g, ""),
			},
			{
				onSuccess: () => {
					navigate("/reservation/finish");
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to create reservation. Try it later.",
					});
				},
			},
		);
	};

	const renderProcedureInfo = (procedure) => {
		const start = new Date(datetime);
		const end = new Date(start.getTime() + procedure.duration * 1_000 * 60);

		const dateFormatted = formatDate(start);
		const startTimeFormatted = formatTime(start);
		const endTimeFormatted = formatTime(end);

		return (
			<>
				<div>
					Procedure: <span className="fw-bold">{procedure.name}</span>
				</div>
				<div>
					Date:{" "}
					<span className="fw-bold">{`${dateFormatted}, ${startTimeFormatted} - ${endTimeFormatted}`}</span>
				</div>
			</>
		);
	};

	const submitText = isCreatePending ? "Submitting..." : "Submit reservation";

	return (
		<ReservationLayout
			activeStep={2}
			onGoToPreviousStep={handleGoToPreviousStep}
		>
			<div className="d-flex flex-column align-items-center">
				<div style={{ width: 500 }}>
					<DynamicContent
						{...procedureQuery}
						renderContent={renderProcedureInfo}
					/>
					<Form noValidate validated={validated} onSubmit={handleSubmit}>
						<Form.Label className="mt-2">Your email</Form.Label>
						<Form.Control
							type="email"
							value={values.email}
							required
							min={1}
							onChange={handleEmailChange}
						/>
						<Form.Control.Feedback type="invalid">
							Must be valid email
						</Form.Control.Feedback>

						<Form.Label className="mt-2">Your phone number</Form.Label>
						<Form.Control
							value={values.phoneNumber}
							required
							pattern="([0-9]\s*){9}"
							onChange={handlePhoneNumberChange}
						/>
						<Form.Control.Feedback type="invalid">
							Must be valid czech phone number (without country code)
						</Form.Control.Feedback>
						<div className="d-flex justify-content-end mt-4">
							<Button type="submit" disabled={isCreatePending}>
								{submitText}
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</ReservationLayout>
	);
};
