import service from 'feathers-knex'

import knex from '../database'
import {disable} from '../hooks'

export default function () {
	const app = this

	app.service('api/champions', service({
		Model: knex,
		name: 'champions'
	}))

	const championsService = app.service('api/champions')

	championsService.before({
		create: [disable('external')],
		update: [disable('external')],
		patch: [disable('external')],
		remove: [disable('external')]
	})
}
