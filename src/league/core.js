import ChampionMasteryModule from './modules/champion-mastery'
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

		this.championMastery = new ChampionMasteryModule(this)
		this.static = new StaticDataModule(this)
		this.summoner = new SummonerModule(this)
	}
}
