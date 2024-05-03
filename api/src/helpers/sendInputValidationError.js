export const sendInputValidationError = (res, inputName, error) => {
	const capitalizedInputName =
		inputName.charAt(0).toUpperCase() + inputName.slice(1);
	res.status(400).send({
		code: `${capitalizedInputName}NotValid`,
		message: `${capitalizedInputName} not valid`,
		error,
	});
};
