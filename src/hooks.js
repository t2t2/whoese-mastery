import auth from 'feathers-authentication'

export var {
	populateUser, verifyToken
} = auth.hooks

export {
	disable,
	remove
} from 'feathers-hooks'

import errors from 'feathers-errors'

export function updateTimestamps() {
	return function (hook) {
		if (hook.method === 'create') {
			hook.data.created_at = new Date() // eslint-disable-line camelcase
		}

		hook.data.updated_at = new Date() // eslint-disable-line camelcase
	}
}

export function validate(schema) {
	return async function (hook) {
		try {
			hook.data = await schema.validate(hook.data, {
				context: {
					method: hook.method,
					id: hook.id
				}
			})
		} catch (error) {
			if (error.name === 'ValidationError') {
				throw new errors.BadRequest('Validation error', {
					errors: error.errors
				})
			} else {
				console.log(error)
				throw error
			}
		}
	}
}
