<template>
	<div class="players players--scores">
		<div class="players__player" v-for="player in players">
			<summoner :settings="settings" :summoner="player.summoner"></summoner>
			<div class="players__player_score" v-text="player.score || 0"></div>
		</div>
	</div>
</template>

<script>
	import Summoner from '../../components/Summoner.vue'

	export default {
		components: {
			Summoner
		},
		props: {
			players: Object,
			settings: Object
		}
	}
</script>