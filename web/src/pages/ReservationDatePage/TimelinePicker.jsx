import { useState } from "react";
import { SpecifySlotModal } from "./SpecifySlotModal";
import { minutesFromMidnightToTime } from "../AdminOpeningHoursPage/helpers/minutesFromMidnightToTime";

const minutesToPx = (minutes) => minutes / 2;

export const TimelinePicker = ({ slots, procedureDuration, onSubmit }) => {
	const [slotToSpecify, setSlotToSpecify] = useState(undefined);

	const handleSpecifySlotClose = () => {
		setSlotToSpecify(undefined);
	};

	const mappedAvailableTimes = slots.map((slot) => {
		const handleSlotClick = () => {
			setSlotToSpecify(slot);
		};

		const text = `${minutesFromMidnightToTime(slot.from)} - ${minutesFromMidnightToTime(slot.to)}`;

		return (
			<div
				key={slot.from}
				className="bg-primary position-absolute text-white"
				style={{
					top: minutesToPx(slot.from),
					height: minutesToPx(slot.to - slot.from),
					left: 0,
					right: 0,
					cursor: "pointer",
				}}
				onClick={handleSlotClick}
			>
				{text}
			</div>
		);
	});

	const maybeEmptyInfo = slots.length === 0 && (
		<div
			className="h3 d-flex flex-column justify-content-center text-center"
			style={{ height: "100%" }}
		>
			No times available for this day
		</div>
	);

	return (
		<>
			<SpecifySlotModal
				slot={slotToSpecify}
				procedureId={"ahoj"}
				procedureDuration={procedureDuration}
				onClose={handleSpecifySlotClose}
				onSubmit={onSubmit}
			/>
			<div style={{ height: 600, overflow: "auto" }}>
				<div
					className="bg-secondary-subtle position-relative "
					style={{ height: minutesToPx(24 * 60) }}
				>
					{maybeEmptyInfo}
					{mappedAvailableTimes}
				</div>
			</div>
		</>
	);
};
