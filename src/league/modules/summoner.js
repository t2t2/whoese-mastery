import {NotFound} from '../errors'

import ModuleBase from './base'

export default class Summoner extends ModuleBase {
	constructor(core) {
		super(core)

		this.name = 'summoner'
	}

	getByName(region, name) {
		const key = this._makeKey({
			method: 'getByName',
			region,
			name
		})

		return this._checkForCached(key, () => {
			return this.core.utils.makeRateLimitedRequest({
				url: '/api/lol/{region}/v1.4/summoner/by-name/{summonerNames}',
				region,
				query: {
					summonerNames: name
				}
			}).catch(e => {
				if (e instanceof NotFound) {
					e.message = 'Summoner not found'
					throw e
				}
			})
		})
	}
}
