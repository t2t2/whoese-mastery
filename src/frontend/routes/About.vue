<template>
	<div class="static-page">
		<div class="content">
			<h2 class="title is-2">Whose Mastery is it Anyway?</h2>
			<p>When you queue up with friends you can usually guess their picks just from their personality, play style or just based on what they've played the previous times you've queued up. This game puts this knowledge to the test, seeing how well you really know your friends.</p>
			<p>We take infromation from your champion mastery and generate questions based on them. Who has most points on Swain? What does Scott play the most? Who was the last person to take Mordekaiser for a ride?</p>
			<p>Built by t2t2 as part of the 2016 API Challenge</p>
		</div>
	</div>
</template>

<script>
	import pageMixin from '../mixins/page'
	
	export default {
		mixins: [pageMixin]
	}
</script>