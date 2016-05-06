import _ from 'lodash'
import makeDebug from 'debug'

import config from '../config'
import league from '../league/api'

const debug = makeDebug('app:job')

export default {
	async handle() {
		const app = this

		debug('Running champion update')

		const [champions, databaseChampions] = await Promise.all([
			league.static.champions(config.get('services.league.defaultDataRegion')).then(champions => {
				return champions.data
			}),
			app.service('api/champions').find().then(champions => {
				return _.keyBy(champions, 'id')
			})
		])

		await Promise.all(_.map(champions, champion => {
			const shouldChampion = {
				id: champion.id,
				key: champion.key,
				name: champion.name
			}

			if (!databaseChampions[champion.id]) {
				return app.service('api/champions').create(shouldChampion)
			} else if (!_.isEqual(shouldChampion, databaseChampions[champion.id])) {
				return app.service('api/champions').update(champion.id, shouldChampion)
			}
		}))
	}
}
