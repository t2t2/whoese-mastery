import cache from '../cache'
import config from '../config'
import Core from './core'

export default new Core({
	key: config.get('services.league.key'),
	cache,
	limits: config.get('services.league.rateLimits')
})
