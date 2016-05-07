import ModuleBase from './base'

export default class ChampionMastery extends ModuleBase {
	constructor(core) {
		super(core)

		this.name = 'champion-mastery'
	}

	champions(region, playerId, params = {}) {
		params.playerId = playerId

		const key = this._makeKey({
			method: 'champions',
			region,
			params
		})

		return this._checkForCached(key, () => {
			return this.core.utils.makeRateLimitedRequest({
				url: '/championmastery/location/{platform}/player/{playerId}/champions',
				region,
				query: params
			})
		})
	}
}