import Bluebird from 'bluebird'
import service from 'feathers-knex'

import knex from '../database'
import {isAuthenticatedUser} from '../filters'
import {disable, populate, updateTimestamps} from '../hooks'

function isAboutSelf(data, connection) {
	if (connection.user.id !== data.id) {
		return false
	}

	return data
}

function removePlayerIfPossible() {
	async function checkPlayerForRemoval(playerID, app) {
		const player = await app.service('api/players').get(playerID)
		// const room = await app.service('api/rooms').get(player.room_id)

		// TODO: Only if room isn't playing

		// Remove player
		await app.service('api/players').remove(player.id)
	}

	return async (hook) => {
		if (Array.isArray(hook.result)) {
			return Bluebird.mapSeries(hook.result, (session) => {
				return checkPlayerForRemoval(session.player_id, hook.app)
			})
		}
		return checkPlayerForRemoval(hook.result.player_id, hook.app)
	}
}

export default function () {
	const app = this

	app.service('api/sessions', service({
		Model: knex,
		name: 'sessions'
	}))

	const sessionsService = app.service('api/sessions')

	sessionsService.before({
		create: [disable('external'), updateTimestamps()],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})

	sessionsService.after({
		all: [
			populate('summoner', {
				service: 'api/summoners',
				field: 'summoner_id'
			}),
			populate('player', {
				service: 'api/players',
				field: 'player_id'
			})
		],
		remove: [
			removePlayerIfPossible()
		]
	})

	sessionsService.filter([isAuthenticatedUser, isAboutSelf])
}
