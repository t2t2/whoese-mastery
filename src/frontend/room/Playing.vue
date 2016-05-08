<template>
	<div class="room-playing">
		<div class="room-playing__content">
			<component v-for="round in currentRound"
				track-by="id"
				:is="getComponentFromRound(round)"
				transition="slide-timeline-fade"
				:champions="champions"
				:connection="connection"
				:is-owner="isOwner"
				:players="players"
				:room="room"
				:round="round"
				:settings="settings"
				:user-player="userPlayer">
			</component>
		</div>
		<player-scores :players="players" :settings="settings"></player-scores>
	</div>
</template>

<script>
	import kebabCase from 'lodash/kebabCase'

	import roomMixin from '../mixins/room'

	import PlayerScores from './game/PlayerScores.vue'

	import RoundBestSummoner from './game/rounds/BestSummoner.vue'

	export default {
		components: {
			PlayerScores,
			RoundBestSummoner
		},
		computed: {
			currentRound() {
				if (this.currentRoundId) {
					return [this.rounds[this.currentRoundId]]
				}
				return []
			}
		},
		data() {
			return {
				currentRoundId: null
			}
		},
		methods: {
			getComponentFromRound(round) {
				if(round) {
					return kebabCase('round '+round.type)
				}
			}
		},
		mixins: [roomMixin],
		watch: {
			'room.current_round_id': {
				handler(newVal) {
					// For smoother transitions
					if(this.$transitionTimeout) {
						clearTimeout(this.$transitionTimeout)
					}
					this.currentRoundId = null
					this.$transitionTimeout = setTimeout(() => {
						this.$transitionTimeout = null
						this.currentRoundId = newVal
					}, 500)
				},
				immediate: true
			}
		}
	}
</script>