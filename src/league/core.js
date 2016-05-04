import StaticDataModule from './modules/static-data'
import SummonerModule from './modules/summoner'

import Utils from './utils'
import * as errors from './errors'

export default class LeagueAPICore {
	constructor({cache, key, limits}) {
		this.cache = cache
		this.key = key

		this.errors = errors
		this.utils = new Utils(this, limits)

		this.static = new StaticDataModule(this)
		this.summoner = new SummonerModule(this)
	}
}
