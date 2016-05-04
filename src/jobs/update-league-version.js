import _ from 'lodash'
import moment from 'moment'

import config from '../config'
import league from '../league/api'

export default {
	repeating: moment.duration(1, 'days'),
	async handle(job) {
		const app = this

		console.log('Running League Update')

		const [version, databaseVersion] = await Promise.all([
			league.static.realm(config.get('services.league.defaultDataRegion')),
			app.service('api/settings').get('league_versions')
		])

		const shouldBe = _.assign({}, version.n, _.pick(version, ['cdn', 'v']))

		if (!_.isEqual(shouldBe, databaseVersion)) {
			await app.service('api/settings').patch('league_versions', {
				value: shouldBe
			})
		}
	}
}