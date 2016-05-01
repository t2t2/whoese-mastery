import cloneDeep from 'lodash/cloneDeep'

export default {
	data() {
		return {
			connection: {
				connected: false,
				reason: 'Connecting...',
				user: null
			}
		}
	},
	ready() {
		// hook into feathers client
		const socket = this.$feathers.io

		// Take the current user
		const that = this
		const oldSet = this.$feathers.set
		this.$feathers.set = function(...args) {
			if(args[0] == 'user') {
				that.connection.user = cloneDeep(args[1])
			}
			oldSet.apply(this, args)
		}

		socket.on('connect', () => {
			this.connection.connected = true
			this.connection.reason = ''

			// Resumse authenticated user
			if(this.$feathers.get('token')) {
				this.$feathers.authenticate().then(result => {
					this.connection.user = cloneDeep(result.data)
				}).catch(error => {
					this.connection.user = null
				})
			}
		})

		socket.on('connect_error', reason => {
			this.connection.connected = false
			this.connection.reason = `Couldn't connect (${reason})`
		})

		socket.on('connect_timeout', time => {
			const formattedTime = Math.round(time / 1000)

			this.connection.connected = false
			this.connection.reason = `Connection timed out (${formattedTime}s)`
		})

		socket.on('reconnecting', attempt => {
			this.connection.connected = false
			this.connection.reason = `Reconnecting... (attempt ${attempt})`
		})

		socket.on('reconnect_failed', () => {
			this.connection.connected = false
			this.connection.reason = `Connection failed, try again later`
		})
	}
}
