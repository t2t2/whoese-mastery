<template>
	<div class="round-answer">
		<ul class="round-answer__choices">
			<li class="round-answer__choice" v-for="player in players">
				<label class="radio">
					<input type="radio" v-model="choice" :value="player.id" class="round-answer__radio" />
					<summoner class="summoner--inline" :settings="settings" :summoner="player.summoner"></summoner>
				</label>
			</li>
		</ul>
		<button class="button button--main" :disabled="answering">Send your answer</button>
	</div>
</template>

<script>
	import Summoner from '../../../../components/Summoner.vue'

	export default {
		components: {
			Summoner
		},
		data() {
			return {
				answering: false,
				choice: null
			}
		},
		props: {
			players: Object,
			round: Object,
			settings: Object,
			userPlayer: null
		}
	}
</script>