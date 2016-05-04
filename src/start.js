/* eslint-disable xo/no-process-exit */

// Ensure config is loaded first to make sure debug gets configured
import config from './config'

// Make sure league API key is provided
if (!config.has('services.league.key')) {
	console.error('Missing configuration item: services.league.key')
	process.exit(1)
}

import makeServer from './server'

makeServer().then(app => {
	global.app = app
}).catch(e => {
	console.error(e.stack)
	process.exit(1)
})
