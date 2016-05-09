import _ from 'lodash'

export default class BestSummonerGenerator {
	constructor(storage) {
		this.storage = storage

		this.cache = this.generateCache(this.storage.masteries, this.storage.players)
	}

	generateCache(masteries, players) {
		return _(masteries)
			// Only data that is needed for this
			.map(mastery => {
				// level for results
				return _.pick(mastery, ['playerId', 'championId', 'championPoints', 'championLevel'])
			})
			// Group by champion
			.groupBy('championId')
			.map((championMasteries, championId) => {
				championId = _.toNumber(championId)

				let masteries = _.keyBy(championMasteries, 'playerId')
				// Add any missing players
				_.map(players, player => {
					const playerId = player.id
					if (!(playerId in masteries)) {
						masteries[playerId] = {
							playerId,
							championId,
							championPoints: 0,
							championLevel: 0
						}
					}
				})
				masteries = _.orderBy(masteries, 'championPoints', 'desc')

				// calculate fun rating
				let fun = 0 // Fun rating

				const difference = masteries[0].championPoints - masteries[1].championPoints
				const differenceRatio = masteries[0].championPoints / Math.max(masteries[1].championPoints, 1)
				// If difference between top 2 is too wide, start lowering the fun
				// This formula is totally from a bunch of random attempts
				fun -= Math.pow(1.03, Math.log(difference * Math.log(differenceRatio)) * 10) / 10 - 1

				// extra -fun for superlow
				if (masteries[1].championPoints < 100) {
					fun -= 2
				}

				// Add a bit of random
				fun += Math.random()

				return {
					championId,
					masteries,
					fun,
					stats: {
						difference,
						differenceRatio
					}
				}
			})
			.orderBy('fun', 'asc')
			.value()
	}

	getRound() {
		const from = this.cache.pop()

		const round = {
			type: 'bestSummoner',
			phase: 'not-started',
			round_info: { // eslint-disable-line camelcase
				championId: from.championId
			},
			answer_info: { // eslint-disable-line camelcase
				correct: from.masteries[0].playerId,
				values: _(from.masteries).map((mastery) => {
					return _.pick(mastery, ['playerId', 'championPoints', 'championLevel'])
				}).keyBy('playerId').value()
			}
		}

		return round
	}
}
