import _ from 'lodash'

export function configure(io) {
	const app = this

	io.on('connection', socket => {
		// Delay check
		socket.on('time', (timestamp, callback) => {
			callback(timestamp, (new Date()).getTime())
		})

		// Clean up session if it ended without problems
		socket.on('disconnect', async () => {
			if (socket.feathers.user && socket.feathers.user.id) {
				try {
					await app.service('api/sessions').remove(socket.feathers.user.id)
				} catch (e) {
					console.error('Error removing traces of old user', e)
				}
			}
		})
	})
	
	const onSessionChange = session => {
		_.forEach(app._socketInfo.clients(), socket => {
			if(socket.feathers.user && socket.feathers.user.id === session.id) {
				socket.feathers.user = _.cloneDeep(session)
				socket.emit('user', session)
			}
		})
	}
	
	app.service('api/sessions').on('updated', onSessionChange)
	app.service('api/sessions').on('patched', onSessionChange)
}

