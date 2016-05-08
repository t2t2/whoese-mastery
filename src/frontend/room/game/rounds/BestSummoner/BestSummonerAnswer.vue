<template>
	<div class="round-answer">
		<ul class="round-answer__choices">
			<li v-for="player in players"
				class="round-answer__choice"
				:class="{'round-answer__choice--enabled': userPlayer, 'round-answer__choice--active': player.id == choice}"
				@click="choose(player)">
				<summoner class="summoner--inline" :settings="settings" :summoner="player.summoner"></summoner>
			</li>
		</ul>
		<button v-if="userPlayer" class="button button--main" :disabled="answering">Send your answer</button>
	</div>
</template>

<script>
	import Summoner from '../../../../components/Summoner.vue'

	export default {
		components: {
			Summoner
		},
		data() {
			return {
				answering: false,
				choice: null
			}
		},
		methods: {
			choose(player) {
				if(this.userPlayer) {
					this.choice = player.id
				}
			}
		},
		props: {
			players: Object,
			round: Object,
			settings: Object,
			userPlayer: null
		}
	}
</script>