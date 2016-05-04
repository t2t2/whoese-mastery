<template>
	<div class="layout__centered-wrapper">
		<div class="layout__centered missing-page">
			<h2 class="title is-2 missing-page__title">404 URF Not Found</h2>
			<p>I'm not sure where you were heading but it sure ain't here. <a v-link="{name: 'home'}">Let's start from the beginning?</a></p>
		</div>
	</div>
</template>

<script>
	import PageMixin from '../mixins/page'

	export default {
		mixins: [PageMixin]
	}
</script>