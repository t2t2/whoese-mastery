<template>
	<div class="room-ended">
		<div class="room-ended__content">
			<h3 class="title is-2">GG</h3>
			
			<player-scores
				:players="players"
				:settings="settings">
			</player-scores>
		</div>
	</div>
</template>

<script>
	import roomMixin from '../mixins/room'

	import PlayerScores from './game/PlayerScores.vue'

	export default {
		components: {
			PlayerScores
		},
		mixins: [roomMixin]
	}
</script>