import service from 'feathers-knex'

import knex from '../database'
import {disable, jsonParseFields, jsonStringifyFields} from '../hooks'

export default function () {
	const app = this

	app.service('api/settings', service({
		Model: knex,
		name: 'settings',
		id: 'key'
	}))

	const settingsService = app.service('api/settings')

	settingsService.before({
		create: [disable('external'), jsonStringifyFields('value')],
		update: [disable('external'), jsonStringifyFields('value')],
		patch: [disable('external'), jsonStringifyFields('value')],
		remove: [disable('external')]
	})

	settingsService.after({
		all: jsonParseFields('value')
	})
}
