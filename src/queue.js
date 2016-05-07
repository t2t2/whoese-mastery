import QueueManager from './queue/queue-manager'

import createGameRounds from './jobs/create-game-rounds'
import updateChampions from './jobs/update-champions'
import updateLeagueVersion from './jobs/update-league-version'

export default function () {
	const app = this

	app.queue = new QueueManager({
		app,
		service: 'internal/jobs'
	})

	app.queue.registerJobs({
		createGameRounds,
		updateChampions,
		updateLeagueVersion
	})
}
