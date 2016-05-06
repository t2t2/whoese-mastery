<template>
	<div class="room-lobby">
		<div class="room-lobby__header">
			<div class="room-lobby__info">
				<button v-if="isOwner" class="button" :disabled="!gameCanBeStarted">Start Game</button>
			</div>
			<join-widget v-if="room.join_code" class="room-lobby__join" :room="room"></join-widget>
		</div>
		<div class="room-lobby__players">
			<div class="room-lobby__player" v-for="player in players">
				<summoner class="summoner--large" :settings="settings" :summoner="player.summoner"></summoner>
			</div>
		</div>
	</div>
</template>

<script>
	import JoinWidget from './LobbyJoinWidget.vue'
	import Summoner from '../components/Summoner.vue'
	import roomMixin from '../mixins/room'

	export default {
		computed: {
			gameCanBeStarted() {
				return Object.keys(this.players).length >= 2
			}
		},
		data() {
			return {}
		},
		components: {
			JoinWidget,
			Summoner
		},
		mixins: [roomMixin]
	}
</script>