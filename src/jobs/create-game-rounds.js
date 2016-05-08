import _ from 'lodash'
import makeDebug from 'debug'
import moment from 'moment'

import Generator from '../rounds-generator/generator'
import league from '../league/api'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		const roomID = job.payload.roomID

		debug('Running game rounds creation', roomID)

		async function somethingsWrong(message) {
			await job.del()
			await app.service('api/rooms').patch(roomID, {
				state: 'lobby'
			})
			throw new Error(message)
		}

		if (job.attempts > 3) {
			// Never mind
			return somethingsWrong('Failed too many times')
		}

		const [room, players] = await Promise.all([
			app.service('api/rooms').get(roomID),
			app.service('api/players').find({
				query: {
					room_id: roomID // eslint-disable-line camelcase
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
		let loaded = 1
		const masteryInfo = await Promise.all(_.map(players, player => {
			return league.championMastery.champions(player.summoner.region, player.summoner.riot_id).then(mastery => {
				sendProgressEvent(++loaded)
				return {
					player: player.id,
					mastery
				}
			})
		}))

		const roundCount = 10 // Later: Dynamic?

		const generator = new Generator(players, masteryInfo)

		let rounds = generator.generate(roundCount)

		// Attach room info
		rounds = _.map(rounds, (round) => {
			return Object.assign({}, round, {
				room_id: room.id // eslint-disable-line camelcase
			})
		})

		await app.service('api/rounds').create(rounds)
		await app.service('api/rooms').patch(room.id, {
			state: 'playing'
		})
		sendProgressEvent(steps)

		app.queue.push('roomNextRound', {
			roomID: room.id
		})
	},
	retry: moment.duration(5, 'seconds')
}
