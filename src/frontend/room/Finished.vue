<template>
	<div class="room-playing">
		<div class="room-playing__content">
			<pre v-text="room | json"></pre>
			<pre v-text="rounds | json"></pre>
		</div>
	</div>
</template>

<script>
	import roomMixin from '../mixins/room'

	export default {
		mixins: [roomMixin]
	}
</script>