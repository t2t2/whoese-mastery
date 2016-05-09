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
			:answers="answers"
			:players="players"
			:round="round"
			:settings="settings"
			:user-answer="userAnswer"
			:user-player="userPlayer">
		</component>
	</div>
</template>

<script>
	import roundMixin from '../../../mixins/round'

	import Champion from '../../../components/Champion.vue'
	
	import BestSummonerAnswer from './BestSummoner/BestSummonerAnswer.vue'
	import BestSummonerResult from './BestSummoner/BestSummonerResult.vue'

	export default {
		components: {
			BestSummonerAnswer,
			BestSummonerResult,
			Champion
		},
		computed: {
			phaseComponent() {
				switch(this.round.phase) {
					case 'question': {
						return 'best-summoner-answer'
					}
					case 'answer': {
						return 'best-summoner-result'
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