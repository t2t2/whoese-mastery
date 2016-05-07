<template>
	<div class="room-lobby">
		<div class="room-lobby__header">
			<div class="room-lobby__info">
				<button v-if="userPlayer"
					class="button"
					@click="leaveGame"
					:disabled="activity == 'leaving'">
					Leave Game
				</button>
				<button v-if="isOwner"
					class="button button--primary"
					title="2+ players required"
					@click="startGame"
					:disabled="!gameCanBeStarted || activity == 'starting'">
					Start Game
				</button>
			</div>
			<join-widget v-if="room.join_code && userPlayer" class="room-lobby__join" :room="room"></join-widget>
		</div>
		<errors v-if="errors" :errors="errors"></errors>
		<div class="room-lobby__players">
			<div class="room-lobby__player fast" v-for="player in players" transition="slide-up-fade">
				<summoner class="summoner--large" :settings="settings" :summoner="player.summoner"></summoner>
			</div>
		</div>
	</div>
</template>

<script>
	import Errors from '../components/Errors.vue'
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
			return {
				activity: null,
				errors: null
			}
		},
		components: {
			Errors,
			JoinWidget,
			Summoner
		},
		methods: {
			leaveGame() {
				if(!this.userPlayer || this.activity == 'leaving') {
					return
				}
				
				this.activity = 'leaving'
				
				this.$service('api/players').remove(this.userPlayer.id).then(result => {
					this.activity = null
				}).catch(error => {
					this.activity = null
					this.errors = error
				})
			},
			startGame() {
				if(!this.isOwner || !this.gameCanBeStarted || this.activity == 'leaving') {
					return
				}
				
				this.activity = 'starting' 
				
				this.$service('api/rooms').patch(this.room.id, {
					state: 'loading'
				}).then(result => {
					this.activity = null
				}).catch(error => {
					this.activity = null
					this.errors = error
				})
			}
		},
		mixins: [roomMixin]
	}
</script>