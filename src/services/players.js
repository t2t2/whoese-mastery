import service from 'feathers-knex'

import knex from '../database'
import {disable, updateTimestamps} from '../hooks'

export default function () {
	const app = this

	app.service('api/players', service({
		Model: knex,
		name: 'players'
	}))

	const playersService = app.service('api/players')

	playersService.before({
		create: [disable('external'), updateTimestamps()],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})
}
