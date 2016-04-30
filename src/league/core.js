import Utils from './utils'
import SummonerModule from './modules/summoner'
import * as errors from './errors'

export default class LeagueAPICore {
	constructor({cache, key, limits}) {
		this.cache = cache
		this.key = key

		this.errors = errors
		this.utils = new Utils(this, limits)

		this.summoner = new SummonerModule(this)
	}
}
