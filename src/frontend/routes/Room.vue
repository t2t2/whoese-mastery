<template>
	<div class="room__wrapper">
		<div class="room__donezo" v-if="!$loadingSyncers && !room">
			<p>This room has ended</p>
			<a v-link="{name: 'home'}">Go home</a>
		</div>
		<div class="room" v-if="!$loadingSyncers && room">
			<lobby
				:is-owner="isOwner"
				:players="players"
				:room="room"
				:settings="settings"
				:user-player="userPlayer">
			</lobby>
			<button @click="debug = !debug">Debug</button>
			<div v-if="debug">
				<pre v-text="room | json"></pre>
				<pre v-text="players | json"></pre>
				<pre v-text="userPlayer | json"></pre>
			</div>
		</div>
	</div>
</template>

<script>
	import toNumber from 'lodash/toNumber'
	
	import Lobby from '../room/Lobby.vue'
	
	import pageMixin from '../mixins/page'

	export default {
		components: {
			Lobby
		},
		computed: {
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
		data() {
			return {
				debug: false
			}
		},
		methods: {
			toggleDebug() {
				this.debug = !this.debug
			}
		},
		mixins: [pageMixin],
		sync: {
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
			}
		}
	}
</script>