<template>
	<div class="round-answer__wrapper">
		<errors v-if="errors" :errors="errors"></errors>
		<div class="round-answer">
			<ul class="round-answer__choices">
				<li v-for="player in players"
					class="round-answer__choice"
					:class="getItemClasses(player)"
					@click="choose(player)">
					<summoner class="summoner--inline" :settings="settings" :summoner="player.summoner"></summoner>
				</li>
			</ul>
			<button v-if="userPlayer" class="button button--main" :disabled="answering || userAnswer" @click="sendAnswer">Send your answer</button>
		</div>
	</div>
</template>

<script>
	import Errors from '../../../../components/Errors.vue'
	import Summoner from '../../../../components/Summoner.vue'

	import propsMixin from './props'

	export default {
		components: {
			Errors,
			Summoner
		},
		data() {
			return {
				answering: false,
				choice: null,
				errors: null
			}
		},
		methods: {
			choose(player) {
				if(this.userPlayer) {
					this.choice = player.id
				}
			},
			getItemClasses(person) {
				const chosen = person.id === this.choice
				const locked = Boolean(this.userAnswer)
				return {
					'round-answer__choice--enabled': this.userPlayer && !locked,
					'round-answer__choice--active': chosen,
					'round-answer__choice--locked': chosen && locked
				}
			},
			sendAnswer() {
				if (this.answering || this.userAnswer) {
					return
				}
				
				if (!this.choice) {
					this.errors = 'Choose the player!'
				}
				
				this.$service('api/round-answers').create({
					round_id: this.round.id,
					answer: {
						player_id: this.choice
					}
				})
			}
		},
		mixins: [propsMixin]	
	}
</script>