import _ from 'lodash'

import makeDebug from 'debug'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		const roomID = job.payload.roomID

		debug('Switching to next round', roomID)

		async function somethingsWrong(message) {
			await job.del()
			await app.service('api/rooms').patch(roomID, {
				state: 'finished'
			})
			throw new Error(message)
		}

		if (job.attempts > 5) {
			// Never mind
			throw somethingsWrong('Failed too many times')
		}

		const room = await app.service('api/rooms').get(roomID)

		const nextRoundMinID = room.current_round_id || 0

		const nextRoundCandidate = await app.service('api/rounds').find({
			query: {
				id: {
					$gt: nextRoundMinID
				},
				room_id: room.id, // eslint-disable-line camelcase
				$limit: 1,
				$sort: {
					id: 1
				}
			}
		})

		if (!nextRoundCandidate.length) {
			await app.service('api/rooms').patch(roomID, {
				state: 'finished'
			})
			return
		}

		const nextRound = nextRoundCandidate[0]

		await app.service('api/rooms').patch(room.id, {
			current_round_id: nextRound.id // eslint-disable-line camelcase
		})

		app.queue.push(_.camelCase('start ' + nextRound.type), {
			roundID: nextRound.id,
			roomID: room.id
		})
	}
}
