import service from 'feathers-knex'

import knex from '../database'
import {disable, updateTimestamps} from '../hooks'

export default function () {
	const app = this

	app.service('api/summoners', service({
		Model: knex,
		name: 'summoners'
	}))

	const summonersService = app.service('api/summoners')

	summonersService.before({
		create: [disable('external'), updateTimestamps()],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})
}
