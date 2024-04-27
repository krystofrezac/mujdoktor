let procedures = [
	{
		id: 0,
		name: "Preventivní prohlídka",
		duration: 60,
	},
	{
		id: 1,
		name: "Vstupní prohlídka",
		duration: 120,
	},
];

export const getProcedures = () => procedures;

export const createProcedure = ({ name, duration }) => {
	const id = procedures.length;
	const procedure = { id, name, duration };
	procedures.push(procedure);

	return procedure;
};

export const updateProcedure = ({ id, name, duration }) => {
	const index = procedures.findIndex((procedure) => procedure.id === id);
	if (index < 0) {
		return {
			success: false,
			code: "NotFound",
		};
	}

	const procedure = { ...procedures[index], name, duration };
	procedures[index] = procedure;

	return {
		success: true,
		procedure,
	};
};

export const deleteProcedure = (id) => {
	const preLenght = procedures.length;
	procedures = procedures.filter((procedure) => procedure.id !== id);
	const postLength = procedures.length;

	if (preLenght === postLength) {
		return {
			success: false,
			code: "NotFound",
		};
	}

	return {
		success: true,
	};
};
