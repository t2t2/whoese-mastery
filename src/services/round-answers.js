import errors from 'feathers-errors'
import service from 'feathers-knex'

import knex from '../database'
import {associateCurrentPlayer, disable, jsonParseFields, jsonStringifyFields, pluck, populateUser, restrictToAuthenticated, updateTimestamps, userMustBeRoomPlayer, verifyToken} from '../hooks'

import bestSummonerValidator from './answer-validations/best-summoner'

async function getRoomFromHook(hook) {
	if (!hook.data.round_id) {
		throw new errors.Forbidden('Need room')
	}

	const round = hook.round = await hook.app.service('api/rounds').get(hook.data.round_id)
	return round.room_id
}

function notAlreadySubmitted() {
	return async function (hook) {
		const existCheck = await this.find({
			query: {
				round_id: hook.data.round_id, // eslint-disable-line camelcase
				player_id: hook.data.player_id // eslint-disable-line camelcase
			}
		})

		if (existCheck.length) {
			throw new errors.Forbidden('You have already submitted an answer')
		}
	}
}

function validateBasedOnRound() {
	const validations = {
		bestSummoner: bestSummonerValidator
	}

	return function (hook) {
		if (!hook.round) {
			throw new errors.GeneralError('Server error validating your answer')
		}
		if (!(hook.round.type in validations)) {
			throw new errors.GeneralError('Server error validating your answer for this round')
		}

		return validations[hook.round.type](hook)
	}
}

export default function () {
	const app = this

	app.service('api/round-answers', service({
		Model: knex,
		name: 'round_answers'
	}))

	const roundAnswersService = app.service('api/round-answers')

	roundAnswersService.before({
		create: [
			verifyToken(),
			populateUser(),
			restrictToAuthenticated(),
			pluck('round_id', 'answer'),
			userMustBeRoomPlayer(getRoomFromHook),
			associateCurrentPlayer(),
			validateBasedOnRound(),
			notAlreadySubmitted(),
			jsonStringifyFields('answer'),
			updateTimestamps()
		],
		update: [disable('external'), jsonStringifyFields('answer'), updateTimestamps()],
		patch: [disable('external'), jsonStringifyFields('answer'), updateTimestamps()],
		remove: [disable('external')]
	})

	roundAnswersService.after({
		all: [jsonParseFields('answer')]
	})
}
