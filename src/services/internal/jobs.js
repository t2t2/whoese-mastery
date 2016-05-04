import service from 'feathers-knex'

import knex from '../../database'
import {disable} from '../../hooks'

export default function () {
	const app = this

	app.service('internal/jobs', service({
		Model: knex,
		name: 'jobs'
	}))

	const jobsService = app.service('internal/jobs')

	jobsService.before({
		create: [disable('external')],
		update: [disable('external')],
		patch: [disable('external')],
		remove: [disable('external')]
	})

	jobsService.filter(() => false)
}
