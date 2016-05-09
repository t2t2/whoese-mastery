<template>
	<div class="room__wrapper">
		<div class="room__donezo" v-if="!$loadingSyncers && !room">
			<p>This room has ended</p>
			<a v-link="{name: 'home'}">Go home</a>
		</div>
		<div class="room" v-if="!$loadingSyncers && room">
			<component
				:is="currentView"
				transition="slide-timeline-fade"
				transition-mode="out-in"
				:champions="champions"
				:connection="connection"
				:is-owner="isOwner"
				:players="players"
				:room="room"
				:rounds="rounds"
				:settings="settings"
				:user-player="userPlayer">
			</component>
		</div>
	</div>
</template>

<script>
	import toNumber from 'lodash/toNumber'
	
	import RoomFinished from '../room/Finished.vue'
	import RoomLoading from '../room/Loading.vue'
	import RoomLobby from '../room/Lobby.vue'
	import RoomPlaying from '../room/Playing.vue'
	
	import pageMixin from '../mixins/page'

	export default {
		components: {
			RoomFinished,
			RoomLoading,
			RoomLobby,
			RoomPlaying
		},
		computed: {
			currentView() {
				if(this.room) {
					switch(this.room.state) {
						case 'lobby': {
							return 'room-lobby'
						}
						case 'loading': {
							return 'room-loading'
						}
						case 'playing': {
							return 'room-playing'
						}
						case 'finished': {
							return 'room-finished'
						}
					}
				}
				return
			},
			isOwner() {
				if(this.userPlayer && this.room) {
					return this.userPlayer.id === this.room.owner_player_id
				}
				return false
			},
			roomID() {
				return toNumber(this.$route.params.room_id)
			},
			userPlayer() {
				if(this.connection.user && this.connection.user.player_id) {
					return this.players[this.connection.user.player_id] || null
				}
				return null
			}
		},
		mixins: [pageMixin],
		sync: {
			champions: 'api/champions',
			room: {
				service: 'api/rooms',
				id() {
					return this.roomID
				}
			},
			players: {
				service: 'api/players',
				query() {
					return {
						room_id: this.roomID
					}
				}
			},
			rounds: {
				service: 'api/rounds',
				query() {
					return {
						room_id: this.roomID
					}
				}
			}
		}
	}
</script>