import service from 'feathers-knex'

import knex from '../database'
import {disable, populate, updateTimestamps} from '../hooks'

export default function () {
	const app = this

	app.service('api/sessions', service({
		Model: knex,
		name: 'sessions'
	}))

	const sessionsService = app.service('api/sessions')

	sessionsService.before({
		create: [disable('external'), updateTimestamps()],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})

	sessionsService.after({
		all: [
			populate('summoner', {
				service: 'api/summoners',
				field: 'summoner_id'
			}),
			populate('player', {
				service: 'api/players',
				field: 'player_id'
			})
		]
	})
}
