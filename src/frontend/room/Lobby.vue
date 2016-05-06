<template>
	<div class="room-lobby">
		<div class="room-lobby__header">
			<div class="room-lobby__info">
				<button v-if="isOwner" class="button" :disabled="gameCanBeStarted">Start Game</button>
			</div>
			<join-widget class="room-lobby__join" :room="room"></join-widget>
		</div>
		<div class="room-lobby__players">
			
		</div>
	</div>
</template>

<script>
	import JoinWidget from './LobbyJoinWidget.vue'
	import roomMixin from '../mixins/room'

	export default {
		computed: {
			gameCanBeStarted() {
				return Object.keys(this.players).length < 2
			}
		},
		data() {
			return {}
		},
		components: {
			JoinWidget
		},
		mixins: [roomMixin]
	}
</script>