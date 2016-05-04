import bodyParser from 'body-parser'
import feathers from 'feathers'
import makeDebug from 'debug'
import rest from 'feathers-rest'
import socketio from 'feathers-socketio'
import hooks from 'feathers-hooks'

import authentication from './server/auth'
import config from './config'
import database from './database'
import middleware from './server/middleware'
import nunjucks from './server/nunjucks'
import services from './server/services'
import queue from './queue'
import {configure as socketioConfigure} from './server/socket'

const debug = makeDebug('app:server')

export default async function () {
	await ensureDatabase()

	const app = feathers()

	app.configure(nunjucks)

	app.use(bodyParser.json())
	app.use(bodyParser.urlencoded({
		extended: true
	}))

	app.configure(hooks())
	app.configure(rest())
	app.configure(socketio(socketioConfigure))

	app.configure(authentication)

	app.configure(services)

	app.configure(middleware)

	app.configure(queue)

	await startServer(app)

	return app
}

async function ensureDatabase() {
	if (await database.migrate.currentVersion() === 'none') {
		throw new Error('Database seems to be misconfigured')
	}
}

function startServer(app) {
	return new Promise((resolve) => {
		const port = config.get('port')
		app.listen(port, () => {
			debug(`Listening on port ${port}`)
			resolve()
		})
	})
}

