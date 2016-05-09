import service from 'feathers-knex'

import knex from '../database'
import {disable, jsonParseFields, jsonStringifyFields, updateTimestamps} from '../hooks'

export default function () {
	const app = this

	app.service('api/rounds', service({
		Model: knex,
		name: 'rounds'
	}))

	const roundsService = app.service('api/rounds')

	roundsService.before({
		create: [disable('external'), jsonStringifyFields('round_info', 'answer_info'), updateTimestamps()],
		update: [disable('external'), jsonStringifyFields('round_info', 'answer_info'), updateTimestamps()],
		patch: [disable('external'), jsonStringifyFields('round_info', 'answer_info'), updateTimestamps()],
		remove: [disable('external')]
	})
	
	roundsService.after({
		all: [jsonParseFields('round_info', 'answer_info')]
	})
}
