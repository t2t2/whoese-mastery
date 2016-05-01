import _ from 'lodash'
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
		const region = data.region

		const user = await this.getSummonerInfo(region, data.name)

		let summoner = {
			riot_id: user.id, // eslint-disable-line camelcase
			region,
			name: user.name,
			icon_id: user.profileIconId // eslint-disable-line camelcase
		}
		summoner = await this.createOrUpdateSummoner(summoner)

		let session = null
		const sessionData = {
			summoner_id: summoner.id // eslint-disable-line camelcase
		}

		if (params.user) {
			// Already has a session, replace it
			session = await app.service('api/sessions').patch(params.user.id, sessionData)
		} else {
			session = await app.service('api/sessions').create(sessionData)
		}

		return app.service('auth/token').create(session, {
			internal: true
		})
	}

	/**
	 * Retrieve summoner from riot API
	 *
	 * @param region string Region
	 * @param name string Summoner Name
	 */
	async getSummonerInfo(region, name) {
		try {
			const user = await league.summoner.getByName(region, name)

			return user[Object.keys(user)[0]]
		} catch (e) {
			if (e.name === 'NotFound') {
				// Summoner not found
				throw e
			}

			debug('Couldn\'t retrieve user', e)
			throw new errors.Unavailable(e)
		}
	}

	/**
	 * Check if summoner is in database, and create or update accordingly
	 *
	 * @params summonerInfo object What summoner should be like
	 */
	async createOrUpdateSummoner(summonerInfo) {
		const app = this.app
		// Check if summoner is already in database
		let summoner = await app.service('api/summoners').find({
			query: {
				riot_id: summonerInfo.riot_id, // eslint-disable-line camelcase
				region: summonerInfo.region
			}
		})

		if (summoner.length) {
			// Summoner matched, check if there's need to update
			summoner = _.first(summoner)
			const changes = {}

			_.map(summonerInfo, (shouldBe, key) => {
				if (summoner[key] !== shouldBe) {
					changes[key] = shouldBe
				}
			})

			if (Object.keys(changes).length) {
				summoner = await app.service('api/summoners').patch(summoner.id, changes)
			}
		} else {
			// Create summoner
			summoner = await app.service('api/summoners').create(summonerInfo)
		}

		return summoner
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
