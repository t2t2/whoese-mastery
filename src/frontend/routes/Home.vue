<template>
	<div class="layout__centered-wrapper">
		<div class="layout__centered home">
			<div class="home__head">
				<h2 class="title is-1">Whose Mastery Is It Anyway?</h2>
				<p v-text="tagline"></p>
			</div>
			<div class="home__actions">
				<div class="home__action">
					<h3 class="subtitle is-3">Create Room</h3>
					<div class="home__action_description">
						<p>Create a room to invite your friends to!</p>
					</div>
					<button class="button button--main" v-link="{name: 'create-game'}">Create</button>
				</div>
				<div class="home__action">
					<h3 class="subtitle is-3">Join Room</h3>
					<div class="home__action_description">
						<p>Join a room your friends are in</p>
					</div>
					<input type="text" class="input" placeholder="URL or code" @key.enter="joinRoom" v-model="joinCode" />
					<button class="button button--main" @click="joinRoom">Join</button>
				</div>
			</div>
			<div class="home__disclaimer">
				<i class="material-icons">people_outline</i>
				<span class="home__players_info">2 players required</span>
				<span class="home__players_info">3+ recommended</span>
				<span class="home__players_info">Up to {{ settings.limits.value.players }}</span>
			</div>
		</div>
	</div>
</template>

<script>
	import sample from 'lodash/sample'
	
	import pageMixin from '../mixins/page'

	const taglines = [
		'A game of knowing who of your friends plays the meanest Rengar.',
		'A game of figuring out why your friend has 100k mastery points on Swain.',
		'A game of knowing which team comps you should just ff@20.',
		"A game where you still won't get S+",
		'A game of knowing that you know that they know that you know that they know.'
	]

	export default {
		data() {
			return {
				joinCode: '',
				tagline: sample(taglines)
			}
		},
		methods: {
			joinRoom() {
				let joinCode = this.joinCode
				if (joinCode.indexOf('/join/') !== -1) {
					joinCode = joinCode.split('/join/')[1]
				}
				if (!joinCode) {
					return
				}
				this.$route.router.go({
					name: 'join-game',
					params: {
						join_code: joinCode
					}
				})
			},
		},
		mixins: [pageMixin]
	}
</script>