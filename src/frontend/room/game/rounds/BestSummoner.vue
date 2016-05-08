<template>
	<div class="round">
		<h4 class="round__title title is-2">
			Which of you is the best on
			<champion
				class="champion--inline"
				:settings="settings"
				:champions="champions"
				:champion-id="round.round_info.championId">
			</champion>?
		</h4>
		<component
			:is="phaseComponent"
			transition="slide-down-fade"
			transition-mode="out-in"
			:players="players"
			:round="round"
			:settings="settings"
			:user-player="userPlayer">
		</component>
		<pre style="font-size: 0.5em;">{{ round | json }}</pre>
	</div>
</template>

<script>
	import roundMixin from '../../../mixins/round'

	import Champion from '../../../components/Champion.vue'
	
	import BestSummonerAnswer from './BestSummoner/BestSummonerAnswer.vue'

	export default {
		components: {
			BestSummonerAnswer,
			Champion
		},
		computed: {
			phaseComponent() {
				switch(this.round.phase) {
					case 'question': {
						return 'best-summoner-answer'
					}
				}
			}
		},
		data() {
			return {}
		},
		mixins: [roundMixin]
	}
</script>