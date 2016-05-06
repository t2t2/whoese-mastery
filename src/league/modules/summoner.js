import {NotFound} from '../errors'

import ModuleBase from './base'

export default class Summoner extends ModuleBase {
	constructor(core) {
		super(core)

		this.name = 'summoner'
	}

	getByName(region, summonerNames, params = {}) {
		params.summonerNames = summonerNames

		const key = this._makeKey({
			method: 'getByName',
			region,
			params
		})

		return this._checkForCached(key, () => {
			return this.core.utils.makeRateLimitedRequest({
				url: '/api/lol/{region}/v1.4/summoner/by-name/{summonerNames}',
				region,
				query: params
			}).catch(e => {
				if (e instanceof NotFound) {
					e.message = 'Summoner not found'
					throw e
				}
			})
		})
	}
}
