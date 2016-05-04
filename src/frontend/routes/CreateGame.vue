<template>
	<div>
		
	</div>
</template>

<script>
	import PageMixin from '../mixins/page'

	export default {
		mixins: [PageMixin],
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