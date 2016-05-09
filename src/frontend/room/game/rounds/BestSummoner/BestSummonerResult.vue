<template>
	<div class="round-result">
		<h5 class="subtitle is-4">You Thought...</h5>
		<ul class="round-result__answers-list">
			<li class="round-result__answer-wrap"
				v-for="answer in answers">
				<div class="round-result__answerer">
					<summoner
						v-if="players[answer.player_id]"
						class="summoner--inline"
						:settings="settings"
						:summoner="players[answer.player_id].summoner">
					</summoner>
				</div>
				<div class="round-result__answer-arrow">
					<i class="material-icons">arrow_forward</i>
				</div>
				<div class="round-result__answer">
					<summoner
						v-if="players[answer.answer.player_id]"
						class="summoner--inline"
						:settings="settings"
						:summoner="players[answer.answer.player_id].summoner">
					</summoner>
				</div>
			</li>
		</ul>
		<h5 class="subtitle is-4">But the correct answer is...</h5>
		<div class="round-result__correct-answer">
			<summoner
				v-if="players[round.answer_info.correct]"
				class="summoner--inline"
				:settings="settings"
				:summoner="players[round.answer_info.correct].summoner">
			</summoner>
		</div>
	</div>
</template>

<script>
	import Summoner from '../../../../components/Summoner.vue'

	import propsMixin from './props'

	export default {
		components: {
			Summoner
		},
		mixins: [propsMixin]	
	}
</script>