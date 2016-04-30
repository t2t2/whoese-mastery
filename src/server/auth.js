import authentication from 'feathers-authentication'
import errors from 'feathers-errors'
import makeDebug from 'debug'

import config from '../config'
import league from '../league/api'

const debug = makeDebug('app:auth')

class LocalAuthService {
	setup(app) {
		this.app = app

		// prevent regular service events from being dispatched
		if (typeof this.filter === 'function') {
			this.filter(() => false)
		}
	}

	async create(data, params) {
		const app = this.app

		if (!data.name || data.name.length < 0) {
			throw new errors.BadRequest('Missing summoner name')
		}
		if (!(data.region in config.get('services.league.regions'))) {
			throw new errors.BadRequest('Invalid region')
		}

		try {
			let user = await league.summoner.getByName(data.region, data.name)
			
			user = user[Object.keys(user)[0]]
		} catch (e) {
			if(e.name == 'NotFound') {
				// Summoner not found
				throw e
			}
			
			debug('Couldn\'t retrieve user', e)
			throw new errors.Unavailable(e)
		}


		throw new errors.NotImplemented('NYI', {
			errors: [
				"This thingy isn't done yet"
			]
		})
	}
}

export default function () {
	const app = this

	app.configure(authentication({
		setUpSuccessRedirect: false,
		setUpFailureRedirect: false,
		local: false, // replaced by custom
		token: {
			secret: config.get('key')
		},
		userEndpoint: 'api/sessions',
		idField: 'id'
	}))

	// No passport methods are used so feathers objects can be cleaned up from the extra crap
	const _super = app.setup

	app.setup = function () {
		let result = _super.apply(this, arguments)

		if (app.io) {
			app.io.on('connection', socket => {
				delete socket.feathers.req
			})
		}
		if (app.primus) {
			app.primus.on('connection', socket => {
				delete socket.request.feathers.req
			})
		}

		return result
	}

	// Fake-auth to login
	app.use('/auth/local', new LocalAuthService())
}
