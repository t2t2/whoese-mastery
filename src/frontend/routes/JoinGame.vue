<template>
	<div class="layout__centered-wrapper">
		<div class="layout__centered create-room">
			<div v-if="!errors">
				Joining Room...
			</div>
			<errors v-if="errors" :errors="errors"></errors>
			<div class="create-room__actions" v-if="errors">
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
			Errors
		},
		data() {
			return {
				errors: null
			}
		},
		methods: {
			joinRoom() {
				this.errors = null
				this.$service('api/players').create({}, {
					query: {
						join_code: this.$route.params.join_code
					}
				}).then(player => {
					this.$route.router.go({
						name: 'room',
						params: {
							room_id: player.room_id
						},
						replace: true
					})
				}).catch(error => {
					this.errors = error
				})
			}
		},
		ready() {
			this.joinRoom()
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