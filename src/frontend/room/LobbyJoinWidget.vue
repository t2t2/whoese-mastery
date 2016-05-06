<template>
	<div class="room-invite">
		<h4 class="title">Invite your friends</h4>
		<p>Send this url to your friends!</p>
		<input class="room-invite__url" :value="inviteURL" readonly @click="selectValue" @contextmenu="selectValue" />
	</div>
</template>

<script>

	export default {
		computed: {
			inviteURL() {
				if(this.room && this.room.join_code) {
					let url = this.$route.router.stringifyPath({
						name: 'join-game',
						params: {
							join_code: this.room.join_code
						}
					})
					return location.origin + url
				} else {
					return 'Unknown :/'
				}
			}
		},
		methods: {
			selectValue(event) {
				event.target.select()
			}
		},
		props: {
			room: Object
		}
	}
</script>