import service from 'feathers-knex'

import knex from '../database'
import {disable, updateTimestamps} from '../hooks'

export default function () {
	const app = this

	app.service('api/rooms', service({
		Model: knex,
		name: 'rooms'
	}))

	const roomsService = app.service('api/rooms')

	roomsService.before({
		create: [disable('external'), updateTimestamps()],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})
}
