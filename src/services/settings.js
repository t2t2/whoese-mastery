import service from 'feathers-knex'

import knex from '../database'
import {disable} from '../hooks'

function jsonValue(hook) {
	if (Array.isArray(hook.data)) {
		hook.data.map(item => {
			if('value' in item) {
				item.value = JSON.stringify(item.value)
			}
		})
	} else {
		if('value' in hook.data) {
			hook.data.value = JSON.stringify(hook.data.value)
		}
	}
}

function deJsonValue(hook) {
	const result = hook.result
	if (result.data) {
		result = result.data
	}

	if (Array.isArray(result)) {
		result.map(item => {
			item.value = JSON.parse(item.value)
		})
	} else {
		result.value = JSON.parse(result.value)
	}
}

export default function () {
	const app = this

	app.service('api/settings', service({
		Model: knex,
		name: 'settings',
		id: 'key'
	}))

	const settingsService = app.service('api/settings')

	settingsService.before({
		create: [disable('external'), jsonValue],
		update: [disable('external'), jsonValue],
		patch: [disable('external'), jsonValue],
		remove: [disable('external'), jsonValue]
	})

	settingsService.after({
		all: deJsonValue
	})
}
