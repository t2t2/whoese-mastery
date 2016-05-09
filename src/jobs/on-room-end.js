import _ from 'lodash'
import moment from 'moment'

import makeDebug from 'debug'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		const roomID = job.payload.roomID

		debug('Cleaning up after a room', roomID)

		if (job.attempts > 3) {
			// Never mind
			await job.del()
			return
		}

		const players = await app.service('api/players').find({
			query: {
				room_id: roomID
			}
		})

		// Remove sessions from the players
		// There /might/ be a bug in feathers-knex where patching all values that match a query won't push out the updates, so for saftey patch by IDs
		const playerIDs = players.map(player => player.id)
		const sessions = await app.service('api/sessions').find({
			query: {
				player_id: { // eslint-disable-line camelcase
					$in: playerIDs
				}
			}
		})

		if (sessions.length) {
			const sessionIDs = sessions.map(session => session.id)
			await app.service('api/sessions').patch(null,
				{
					player_id: null // eslint-disable-line camelcase
				}, {
					query: {
						id: {
							$in: sessionIDs
						}
					}
				})
		}
	},
	retry: moment.duration(3, 'seconds')
}
