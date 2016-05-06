import auth from 'feathers-authentication'

export var {
	populateUser, restrictToAuthenticated, verifyToken
} = auth.hooks

export {
disable, remove, removeQuery, pluck, pluckQuery
} from 'feathers-hooks'

import errors from 'feathers-errors'

// Taken from feathers-hooks, fixed to remove query
export function populate(target, options) {
	options = Object.assign({}, options)

	if (!options.service) {
		throw new Error('You need to provide a service')
	}

	const field = options.field || target

	return function (hook) {
		function populate(item) {
			if (!item[field]) {
				return Promise.resolve(item)
			}

			// Find by the field value by default or a custom query
			const id = item[field]

			if (typeof item.toObject === 'function') {
				// If it's a mongoose model then
				item = item.toObject(options)
			} else if (typeof item.toJSON === 'function') {
				// If it's a Sequelize model
				item = item.toJSON(options)
			}

			const params = Object.assign({}, hook.params, {
				query: {} // Fix extra query being added
			})

			return hook.app.service(options.service)
				.get(id, params)
				.then(relatedItem => {
					if (relatedItem) {
						item[target] = relatedItem
					}

					return item
				}).catch(() => item)
		}

		if (hook.type === 'after') {
			const isPaginated = (hook.method === 'find' && hook.result.data)
			const data = isPaginated ? hook.result.data : hook.result

			if (Array.isArray(data)) {
				return Promise.all(data.map(populate)).then(results => {
					if (isPaginated) {
						hook.result.data = results
					} else {
						hook.result = results
					}

					return hook
				})
			}

			// Handle single objects.
			return populate(hook.result).then(item => {
				hook.result = item
				return hook
			})
		}
	}
}

// Mostly taken from feathers-hooks, changed to run checking per thing
export function removeIndividually(...fields) {
	const callback = typeof fields[fields.length - 1] === 'function' ? fields.pop() : (hook) => Boolean(hook.params.provider)

	const removeFields = (hook, data) => {
		if (callback(hook, data)) {
			console.log('removing')
			for (let field of fields) {
				data[field] = undefined
				delete data[field]
			}
		}
	}

	return function (hook) {
		const result = hook.type === 'before' ? hook.data : hook.result

		if (result) {
			if (Array.isArray(result)) {
				// array
				result.forEach(removeFields.bind(this, hook))
			} else if (result.data) {
				// paginated
				if (Array.isArray(result.data)) {
					result.data.forEach(removeFields.bind(this, hook))
				} else {
					removeFields(hook, result.data)
				}
			} else {
				// one thing
				removeFields(hook, result)
			}
		}

		return hook
	}
}

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
