export const Day = {
	monday: 0,
	tusday: 1,
	wednesday: 2,
	thursday: 3,
	friday: 5,
	saturday: 6,
	sunday: 7,
};

let openingHours = [
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
	{
		from: 8 * 60,
		to: 16 * 60,
	},
];

export const getOpeningHours = () => openingHours;

export const updateOpeningHour = ({ day, from, to }) => {
	openingHours[day] = {
		from,
		to,
	};
};
