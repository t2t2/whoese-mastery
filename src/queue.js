import QueueManager from './queue/queue-manager'

import answerBestSummoner from './jobs/answer-best-summoner'
import createGameRounds from './jobs/create-game-rounds'
import roomNextRound from './jobs/room-next-round'
import startBestSummoner from './jobs/start-best-summoner'
import updateChampions from './jobs/update-champions'
import updateLeagueVersion from './jobs/update-league-version'

export default function () {
	const app = this

	app.queue = new QueueManager({
		app,
		service: 'internal/jobs'
	})

	app.queue.registerJobs({
		answerBestSummoner,
		createGameRounds,
		roomNextRound,
		startBestSummoner,
		updateChampions,
		updateLeagueVersion
	})
}
