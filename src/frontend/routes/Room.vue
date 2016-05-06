<template>
	<div class="room__wrapper">
		<div class="room__donezo" v-if="!$loadingSyncers && !room">
			<p>This room has ended</p>
			<a v-link="{name: 'home'}">Go home</a>
		</div>
		<div class="room" v-if="!$loadingSyncers && room">
			<pre v-text="room | json"></pre>
			<pre v-text="players | json"></pre>
		</div>
	</div>
</template>

<script>
	import toNumber from 'lodash/toNumber'
	
	import pageMixin from '../mixins/page'

	export default {
		computed: {
			roomID() {
				return toNumber(this.$route.params.room_id)
			}
		},
		data() {
			return {}
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