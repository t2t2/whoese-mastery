<template>
	<div class="room-ended">
		<div class="room-ended__content">
			<h3 class="title is-2">And the {{ winners.length > 1 ? 'winners' : 'winner' }} with {{winnerScore}} points {{ winners.length > 1 ? 'are' : 'is' }}...</h3>
			
			<div class="room-ended__winners">
				<summoner v-for="winner in winners" :settings="settings" :summoner="winner.summoner"></summoner>
			</div>
			
			<h4 class="room-ended__taunty subtitle is-4">Feel free to taunt the losers as much as you want over this</h4>
			
			<player-scores
				:players="players"
				:settings="settings">
			</player-scores>
		</div>
	</div>
</template>

<script>
	import filter from 'lodash/filter'
	import map from 'lodash/map'
	import max from 'lodash/max'

	import roomMixin from '../mixins/room'

	import PlayerScores from './game/PlayerScores.vue'
	import Summoner from '../components/Summoner.vue'

	export default {
		computed: {
			winners() {
				return filter(this.players, ['score', this.winnerScore])
			},
			winnerScore() {
				// not directly used due to ties
				return max(map(this.players, 'score'))
			}
		},
		components: {
			PlayerScores,
			Summoner
		},
		mixins: [roomMixin]
	}
</script>