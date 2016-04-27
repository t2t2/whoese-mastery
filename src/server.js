import bodyParser from 'body-parser'
import feathers from 'feathers'
import makeDebug from 'debug'
import rest from 'feathers-rest'
import socketio from 'feathers-socketio'
import hooks from 'feathers-hooks'

import authentication from './server/auth'
import config from './config'
import middleware from './server/middleware'
import nunjucks from './server/nunjucks'
import {configure as socketioConfigure} from './server/socket'

const debug = makeDebug('app:server')

export default async function () {
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

	app.configure(middleware)

	await startServer(app)

	return app
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
