import _ from 'lodash'
import errors from 'feathers-errors'
import randomstring from 'randomstring'
import service from 'feathers-knex'

import knex from '../database'
import {disable, updateTimestamps, pluck, pluckQuery, populateUser, removeIndividually, restrictToAuthenticated, userMustBeRoomOwner, verifyToken} from '../hooks'

function addPlayerAsRoomOwner() {
	return async function (hook) {
		if (!hook.params.provider) {
			return
		}

		const createPlayerParams = _.assign({}, hook.params, {
			query: {
				// join_code is removed in .get, .create is internally calling .get so it get's sniped away
				join_code: hook.data.join_code // eslint-disable-line camelcase
			}
		})

		// Add as player
		const player = await hook.app.service('api/players').create({}, createPlayerParams)

		// Set as owner
		await hook.app.service('api/rooms').patch(hook.result.id, {
			owner_player_id: player.id // eslint-disable-line camelcase
		})
		hook.result.owner_player_id = player.id // eslint-disable-line camelcase
	}
}

function generateRoomCode() {
	async function getRandomCode({app}) {
		let code
		while (!code) {
			code = randomstring.generate({
				length: 8,
				readable: true,
				charset: 'alphanumeric'
			})
			// Make sure doesn't exist
			const exists = await app.service('api/rooms').find({
				query: {
					join_code: code, // eslint-disable-line camelcase
					$limit: 1
				}
			})
			if (!exists.length) {
				break
			}
			code = null
		}

		return code
	}

	return async function (hook) {
		const code = await getRandomCode(hook)
		hook.data.join_code = code // eslint-disable-line camelcase
		return hook
	}
}

function flagUserPatchRequests() {
	return async function (hook) {
		if (!hook.params.provider) {
			return
		}

		hook.changing = {}
		if (hook.data.state) {
			switch (hook.data.state) {
				case 'loading': {
					if (hook.room.state !== 'lobby') {
						throw new errors.Forbidden('Room has already been started')
					}
					// Make sure enough players
					const players = await hook.app.service('api/players').find({
						query: {
							room_id: hook.room.id // eslint-disable-line camelcase
						}
					})
					if (players.length < 2) {
						throw new errors.Forbidden('Not enough players')
					}
					hook.changing.state = 'loading'
					break
				}
				default: {
					throw new errors.Forbidden('Invalid request')
				}
			}
		}
		return hook
	}
}

function handleFlaggedRequests() {
	return async function (hook) {
		if (hook.changing) {
			if (hook.changing.state) {
				await hook.app.queue.push('createGameRounds', {
					roomID: hook.result.id
				})
			}
		}
	}
}

function mustNotBeInARoom() {
	return function (hook) {
		if (hook.params.provider && hook.params.user.player_id) {
			throw new errors.Forbidden('You are already playing in a game. Leave it first')
		}
	}
}

function setRoomDefaults() {
	return hook => {
		hook.data.state = 'lobby'

		return hook
	}
}

export default function () {
	const app = this

	const serviceInstance = service({
		Model: knex,
		name: 'rooms'
	})
	// Add custom events we want to broadcast
	if (!serviceInstance.events) {
		serviceInstance.events = []
	}
	serviceInstance.events.push('loading-progress')

	app.service('api/rooms', serviceInstance)

	const roomsService = app.service('api/rooms')

	roomsService.before({
		create: [
			verifyToken(),
			populateUser(),
			restrictToAuthenticated(),
			mustNotBeInARoom(),
			pluck(''), // Need to pluck something
			generateRoomCode(),
			setRoomDefaults(),
			updateTimestamps()
		],
		update: [disable()],
		patch: [
			verifyToken(),
			populateUser(),
			restrictToAuthenticated(),
			userMustBeRoomOwner(hook => hook.id),
			pluckQuery(''),
			pluck('state'),
			flagUserPatchRequests(),
			updateTimestamps()
		],
		remove: [disable('external')]
	})

	roomsService.after({
		all: [
			removeIndividually('join_code', (hook, room) => {
				return hook.method !== 'create' && Boolean(hook.params.provider) && (
					!hook.params.user || !hook.params.user.player_id || hook.params.user.player.room_id !== room.id // eslint-disable-line camelcase
				)
			})
		],
		create: [
			addPlayerAsRoomOwner()
		],
		patch: [
			handleFlaggedRequests()
		]
	})
}
