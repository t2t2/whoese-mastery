import _ from 'lodash'
import makeDebug from 'debug'
import moment from 'moment'

import config from '../config'
import league from '../league/api'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		async function somethingsWrong(message) {
			await job.del()
			await app.service('api/rooms').patch(roomID, {
				state: 'lobby'
			})
			throw new Error(message)
		}

		debug('Running game rounds creation')

		const roomID = job.payload.roomID

		if (job.attempts > 1) {
			// Never mind
			return somethingsWrong('Failed too many times')
		}

		const [room, players] = await Promise.all([
			app.service('api/rooms').get(roomID),
			app.service('api/players').find({
				query: {
					room_id: roomID
				}
			})
		])

		if (players.length < 2) {
			return somethingsWrong('Too few players?')
		}

		const steps = 2 + players.length // preprocess, n players, postprocess

		function sendProgressEvent(step) {
			app.service('api/rooms').emit('loading-progress', {
				id: room.id,
				step,
				total: steps
			})
		}

		sendProgressEvent(1)

		// Load progression
		let loaded = 0
		const masteryInfo = await Promise.all(_.map(players, player => {
			return league.championMastery.champions(player.summoner.region, player.summoner.riot_id).then(mastery => {
				sendProgressEvent(++loaded)
				return {
					player: player.id,
					mastery
				}
			})
		}))

		console.log(masteryInfo)

		throw new Error('NYI')
	},
	retry: moment.duration(5, 'seconds')
}
