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
}

