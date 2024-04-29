export class FetchError extends Error {
	constructor(data) {
		super()
		this.data = data
	}
}

export const wrapFetch = async (req) => {
	const res = await req
	if (!res.ok) {
		throw new FetchError(await res.json())
	}
	try {
		return await res.json()
	} catch {
		return undefined
	}
}
