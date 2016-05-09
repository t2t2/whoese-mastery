import _ from 'lodash'
import makeDebug from 'debug'
import moment from 'moment'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		const roomID = job.payload.roomID
		const roundID = job.payload.roundID

		debug('Answering best summoner', roundID)

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

		const [round, timings, players, answers] = await Promise.all([
			app.service('api/rounds').get(roundID),
			app.service('api/settings').get('timings'),
			app.service('api/players').find({
				query: {
					room_id: roomID // eslint-disable-line camelcase
				}
			}).then(players => {
				return _.keyBy(players, 'id')
			}),
			app.service('api/round-answers').find({
				query: {
					round_id: roundID // eslint-disable-line camelcase
				}
			})
		])

		await app.service('api/rounds').patch(roundID, {
			phase: 'answer'
		})

		// Scoring
		await Promise.all(_.map(answers, answer => {
			if (answer.answer.player_id === round.answer_info.correct) {
				const player = players[answer.player_id]
				if (!player) {
					console.error('Invalid player answered?', answer.id)
					return
				}

				return app.service('api/players').patch(player.id, {
					score: player.score + 100
				})
			}
		}))

		// Next question
		app.queue.later(moment.duration(timings.value.bestSummoner.answer, 'seconds'), 'roomNextRound', {
			roomID
		})
	},
	retry: moment.duration(3, 'seconds')
}
