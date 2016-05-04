import ModuleBase from './base'

export default class StaticData extends ModuleBase {
	constructor(core) {
		super(core)

		this.name = 'static'
		this.cacheDuration = 60 * 60
	}

	realm(region) {
		const key = this._makeKey({
			method: 'region',
			region
		})
		
		return this._checkForCached(key, () => {
			return this.core.utils.makeNonlimitedRequest({
				host: 'global.api.pvp.net',
				url: '/api/lol/static-data/{region}/v1.2/realm',
				region
			})
		})
	}
}