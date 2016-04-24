import config from './config'
import feathers from 'feathers'
import makeDebug from 'debug'

const debug = makeDebug('app:server')

export default async function() {
	const app = feathers()

	await startServer(app)

	return app
}

function startServer(app) {
	return new Promise((resolve, reject) => {
		const port = config.get('port')
		app.listen(port, () => {
			debug(`Listening on port ${port}`)
			resolve()
		})
	})
}

