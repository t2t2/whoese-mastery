import _ from 'lodash'

import BestSummoner from './rounds/best-summoner'

export default class Generator {
	constructor(players, masteryInfo) {
		this.players = players
		this.masteries = this.flattenMasteryData(masteryInfo)

		this.roundGenerators = [
			new BestSummoner(this)
		]
	}

	flattenMasteryData(masteries) {
		return _.flatMap(masteries, (playerMasteries) => {
			const playerId = playerMasteries.player

			return _.map(playerMasteries.mastery, (mastery) => {
				// replace playerId with local ID
				return Object.assign({}, mastery, {
					playerId
				})
			})
		})
	}

	generate(amount) {
		const gotten = []

		while (gotten.length < amount && this.roundGenerators.length > 0) {
			const generatorI = _.random(0, this.roundGenerators.length - 1)

			const round = this.roundGenerators[generatorI].getRound()

			if (round) {
				gotten.push(round)
			} else {
				// depleted
				this.roundGenerators.splice(generatorI, 1)
			}
		}

		return gotten
	}
}
