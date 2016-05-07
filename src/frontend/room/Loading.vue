<template>
	<div class="room-loading">
		<div class="room-loading__content">
			<h3 class="title is-3">Loading Mastery Data...</h3>
			<progress class="progress is-primary" :value="progress.step" :max="progress.total">15%</progress>
		</div>
	</div>
</template>

<script>
	import roomMixin from '../mixins/room'

	export default {
		data() {
			return {
				progress: {
					step: 0,
					total: 1
				}
			}
		},
		destroyed() {
			this.$service('api/rooms').off('loading-progress', this.$progressListener)
		},
		mixins: [roomMixin],
		ready() {
			const progressListener = this.$progressListener = status => {
				if(status.id === this.room.id) {
					this.progress = status
				}
			}
			
			this.$service('api/rooms').on('loading-progress', progressListener)
		}
	}
</script>