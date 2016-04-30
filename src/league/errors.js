class LeagueAPIError extends Error {
	constructor(message, name, code, data) {
		message = (message || 'Error')

		super(message)

		this.name = name
		this.data = data
		this.code = code
	}
	
	toJSON() {
		// Add message to json
		return {
			name: this.name,
			message: this.message,
			code: this.code,
			data: this.data
		}
	}
}


export class BadRequest extends LeagueAPIError {
	constructor(message, data) {
		super(message || 'Bad Request', 'BadRequest', 400, data)
	}
}

export class NotFound extends LeagueAPIError {
	constructor(message, data) {
		super(message || 'Not Found', 'NotFound', 404, data)
	}
}

export class Unauthorized extends LeagueAPIError {
	constructor(message, data) {
		super(message || 'API Authorization Error', 'Unauthorized', 401, data)
	}
}

export class Unavailable extends LeagueAPIError {
	constructor(message, data) {
		super(message || 'API Unavailable', 'Unavailable', 503, data)
	}
}