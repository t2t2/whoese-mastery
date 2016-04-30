import _ from 'lodash'
import memory from 'feathers-memory'

import config from '../config'
import {
	disable
} from '../hooks'

// Dummy service to provide list of regions
const regions = _.mapValues(config.get('services.league.regions'), (value, key) => {
	return {
		id: key,
		name: value
	}
})

export default function () {
	const app = this

	app.service('data/regions', memory({
		store: regions
	}))

	const regionsService = app.service('data/regions')

	regionsService.before({
		create: [disable()],
		update: [disable()],
		patch: [disable()],
		remove: [disable()]
	})
}
