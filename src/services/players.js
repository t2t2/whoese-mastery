import Bluebird from 'bluebird'
import errors from 'feathers-errors'
import service from 'feathers-knex'

import knex from '../database'
import {disable, pluck, populate, populateUser, restrictToAuthenticated, verifyToken, updateTimestamps} from '../hooks'

function assignPlayerToSession() {
	return async (hook) => {
		await hook.app.service('api/sessions').patch(hook.params.user.id, {
			player_id: hook.result.id
		})
	}
}

function checkIfNextRoomOwnerIsNeeded() {
	async function checkRoomForUpdate(player, app) {
		const room = await app.service('api/rooms').get(player.room_id)

		if (room.owner_player_id !== player.id) {
			return
		}

		// Choose another player
		const newOwner = await app.service('api/players').find({
			query: {
				room_id: room.id,
				$limit: 1
			}
		})

		console.log(newOwner)
		if (newOwner.length) {
			await app.service('api/rooms').patch(room.id, {
				owner_player_id: newOwner[0].id
			})
		} else {
			// Remove room
			await app.service('api/rooms').remove(room.id)
		}
	}

	return async (hook) => {
		if (Array.isArray(hook.result)) {
			return Bluebird.mapSeries(hook.result, (session) => {
				return checkRoomForUpdate(session, hook.app)
			})
		} else {
			return checkRoomForUpdate(hook.result, hook.app)
		}
	}
}

function ensureRoomNotFull() {
	return async (hook) => {
		const roomID = hook.data.room_id

		const [players, limitsSetting] = await Promise.all([
			hook.app.service('api/players').find({
				query: {
					room_id: roomID
				}
			}),
			hook.app.service('api/settings').get('limits')
		])

		if (players.length >= limitsSetting.value.players) {
			throw new errors.NotAcceptable('Too many players already in the lobby')
		}
	}
}

function findRoomByCode() {
	return async (hook) => {
		if (!hook.params.query.join_code) {
			throw new errors.BadRequest('Missing join code')
		}

		const joinCode = hook.params.query.join_code
		delete hook.params.query.join_code

		const room = await hook.app.service('api/rooms').find({
			query: {
				join_code: joinCode,
				$limit: 1
			}
		})

		if (!room.length) {
			throw new errors.NotFound('Unknown room')
		}

		hook.data.room_id = room[0].id
	}
}

function mustNotBeInARoom() {
	return hook => {
		if (hook.params.user.player_id) {
			throw new errors.Forbidden('You are already playing in a game. Leave it first')
		}
	}
}

function setSummoner() {
	return (hook) => {
		hook.data.summoner_id = hook.params.user.summoner_id
	}
}

export default function () {
	const app = this

	app.service('api/players', service({
		Model: knex,
		name: 'players'
	}))

	const playersService = app.service('api/players')

	playersService.before({
		create: [
			verifyToken(),
			populateUser(),
			restrictToAuthenticated(),
			mustNotBeInARoom(),
			pluck(''),
			findRoomByCode(),
			ensureRoomNotFull(),
			setSummoner(),
			updateTimestamps()
		],
		update: [disable('external'), updateTimestamps()],
		patch: [disable('external'), updateTimestamps()],
		remove: [disable('external')]
	})

	playersService.after({
		all: [
			populate('summoner', {
				service: 'api/summoners',
				field: 'summoner_id'
			})
		],
		create: [assignPlayerToSession()],
		remove: [checkIfNextRoomOwnerIsNeeded()]
	})

}
