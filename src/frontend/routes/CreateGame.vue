<template>
	<div class="layout__centered-wrapper">
		<div class="layout__centered create-room">
			<div v-if="!errors">
				Creating Room...
			</div>
			<errors v-if="errors" :errors="errors"></errors>
			<div class="create-room__actions" v-if="errors">
				<a @click.prevent="createRoom()">Try Again</a>
				<a v-link="{name: 'home'}">Home</a>
			</div>
		</div>
	</div>
</template>

<script>
	import Errors from '../components/Errors.vue'
	import PageMixin from '../mixins/page'

	export default {
		mixins: [PageMixin],
		components: {
			Errors,
		},
		data() {
			return {
				errors: null
			}
		},
		methods: {
			createRoom() {
				this.errors = null
				this.$service('api/rooms').create({}).then(room => {
					this.$route.router.go({
						name: 'room',
						params: {
							room_id: room.id
						},
						replace: true
					})
					console.log('room', room, this.$route.router.redirect)
				}).catch(error => {
					this.errors = error
				})
			}
		},
		ready() {
			this.createRoom()
		},
		route: {
			activate(transition) {
				if(!this.connection.user) {
					return transition.redirect({
						name: 'login',
						query: {
							next: transition.to.path
						}
					})
				}
				return Promise.resolve()
			}
		}
	}
</script>