import find from 'lodash/find'

export default {
	computed: {
		userAnswer() {
			if (!this.userPlayer) {
				return
			}
			return find(this.answers, answer => answer.player_id === this.userPlayer.id)
		}
	},
	props: {
		champions: Object,
		connection: Object,
		isOwner: Boolean,
		players: Object,
		room: null,
		round: null,
		settings: Object,
		userPlayer: null
	},
	sync: {
		answers: {
			service: 'api/round-answers',
			query() {
				if (this.round) {
					return {
						round_id: this.round.id
					}
				}
				return null
			}
		}
	}
}
