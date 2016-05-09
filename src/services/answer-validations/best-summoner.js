import errors from 'feathers-errors'
import yup from 'yup'

import {validate} from '../../hooks'

const schema = yup.object().shape({
	answer: yup.object()
		.shape({
			player_id: yup.number() // eslint-disable-line camelcase
				.integer()
				.required()
				.test('player-in-room', 'Player is not in the room', function (value) {
					const context = this.options.context
					const hook = context.hook
					return hook.app.service('api/players').find({
						query: {
							id: value,
							room_id: hook.round.room_id // eslint-disable-line camelcase
						}
					}).then(results => {
						return Boolean(results.length)
					})
				})
		}).noUnknown()
})

const validator = validate(schema)

export default async function validateAnswer(hook) {
	const round = hook.round
	// Make sure round is open
	if (round.phase !== 'question') {
		throw new errors.NotAcceptable('Answers are no longer accepted')
	}

	// Validate answer
	return await validator(hook)
}
