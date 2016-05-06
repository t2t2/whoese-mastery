import ModuleBase from './base'

export default class StaticData extends ModuleBase {
	constructor(core) {
		super(core)

		this.name = 'static'
		this.cacheDuration = 60 * 60
	}

	champions(region, params = {}) {
		const key = this._makeKey({
			method: 'champions',
			region,
			params
		})

		return this._checkForCached(key, () => {
			return this.core.utils.makeNonlimitedRequest(Object.assign({
				host: 'global.api.pvp.net',
				url: '/api/lol/static-data/{region}/v1.2/champion',
				region,
				query: params
			}, params))
		})
	}

	realm(region, params = {}) {
		const key = this._makeKey({
			method: 'realm',
			region,
			params
		})

		return this._checkForCached(key, () => {
			return this.core.utils.makeNonlimitedRequest({
				host: 'global.api.pvp.net',
				url: '/api/lol/static-data/{region}/v1.2/realm',
				region,
				query: params
			})
		})
	}
}
