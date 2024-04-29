export const sendError = (res, status, error) =>
	res.status(status).send({ code: error.code, message: error.message });
