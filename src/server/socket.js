export function configure(io) {
	//	const app = this

	io.on('connection', socket => {
		// Delay check
		socket.on('time', (timestamp, callback) => {
			callback(timestamp, (new Date()).getTime())
		})
	})
}

