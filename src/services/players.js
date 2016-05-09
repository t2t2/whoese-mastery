import errors from 'feathers-errors'
import service from 'feathers-knex'

import knex from '../database'
import {disable, map, mapSeries, pluck, populate, populateUser, restrictToAuthenticated, verifyToken, updateTimestamps} from '../hooks'

function assignPlayerToSession() {
	return async (hook) => {
		await hook.app.service('api/sessions').patch(hook.params.user.id, {
			player_id: hook.result.id // eslint-disable-line camelcase
		})
	}
}

function checkIfNextRoomOwnerIsNeeded() {
	async function checkRoomForUpdate(hook, player) {
		const app = hook.app
		const room = await app.service('api/rooms').get(player.room_id)

		if (room.owner_player_id !== player.id && room.owner_player_id) {
			return
		}

		// Choose another player
		const newOwner = await app.service('api/players').find({
			query: {
				room_id: room.id, // eslint-disable-line camelcase
				$limit: 1
			}
		})

		if (newOwner.length) {
			await app.service('api/rooms').patch(room.id, {
				owner_player_id: newOwner[0].id // eslint-disable-line camelcase
			})
		} else {
			// Remove room
			await app.service('api/rooms').remove(room.id)
		}
	}

	return mapSeries(checkRoomForUpdate)
}

function ensureRoomNotFull() {
	return async (hook) => {
		const roomID = hook.data.room_id

		const [players, limitsSetting] = await Promise.all([
			hook.app.service('api/players').find({
				query: {
					room_id: roomID // eslint-disable-line camelcase
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
				join_code: joinCode, // eslint-disable-line camelcase
				$limit: 1
			}
		})

		if (!room.length) {
			throw new errors.NotFound('Unknown room')
		}

		if (room[0].state !== 'lobby') {
			throw new errors.Forbidden('Game is already going on')
		}

		hook.data.room_id = room[0].id // eslint-disable-line camelcase
	}
}

function mustBeSelf() {
	return hook => {
		if (!hook.params.provider) {
			return
		}

		if (!hook.params.user.player_id || hook.params.user.player_id !== hook.id) {
			throw new errors.Forbidden('Invalid player')
		}
	}
}

function mustNotBeInARoom() {
	return hook => {
		if (hook.params.user.player_id) {
			throw new errors.Forbidden('You are already playing in a game. Leave it first')
		}
	}
}

function removeFromSessions() {
	async function sendSessionsPatch(hook, player) {
		const app = hook.app

		// There /might/ be a bug in feathers-knex where patching all values that match a query won't push out the updates, so for saftey patch by IDs
		const sessions = await app.service('api/sessions').find({
			query: {
				player_id: player.id // eslint-disable-line camelcase
			}
		})

		if (sessions.length) {
			const IDs = sessions.map(session => session.id)

			await app.service('api/sessions').patch(null,
				{
					player_id: null // eslint-disable-line camelcase
				}, {
					query: {
						id: {
							$in: IDs
						}
					}
				})
		}
	}

	return map(sendSessionsPatch)
}

function setSummoner() {
	return (hook) => {
		hook.data.summoner_id = hook.params.user.summoner_id // eslint-disable-line camelcase
		hook.data.score = 0
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
		remove: [
			verifyToken(),
			populateUser(),
			restrictToAuthenticated(),
			mustBeSelf()
		]
	})

	playersService.after({
		all: [
			populate('summoner', {
				service: 'api/summoners',
				field: 'summoner_id'
			})
		],
		create: [assignPlayerToSession()],
		remove: [removeFromSessions(), checkIfNextRoomOwnerIsNeeded()]
	})
}
