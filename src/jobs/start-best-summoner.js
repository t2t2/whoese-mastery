import makeDebug from 'debug'
import moment from 'moment'

const debug = makeDebug('app:job')

export default {
	async handle(job) {
		const app = this

		const roomID = job.payload.roomID
		const roundID = job.payload.roundID

		debug('Starting best summoner', roundID)

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

		const [round, timings] = await Promise.all([
			app.service('api/rounds').get(roundID),
			app.service('api/settings').get('timings')
		])

		await app.service('api/rounds').patch(roundID, {
			phase: 'question',
			start_time: moment().toDate()
		})

		// Next phase timing
		// Adds 1 second for last second submissions
		app.queue.later(moment.duration(timings.value.bestSummoner.question + 1, 'seconds'), 'answerBestSummoner', {
			roomID,
			roundID
		})
	},
	retry: moment.duration(3, 'seconds')
}