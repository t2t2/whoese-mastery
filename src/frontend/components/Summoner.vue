<template>
	<div class="username">
		<figure class="image username__image">
			<img :src="icon" />
		</figure>
		<div class="username__name" v-text="name"></div>
		<div class="username__region" v-text="region">EUW</div>
	</div>
</template>

<script>

	export default {
		computed: {
			icon() {
				return this.settings.league_versions.value.cdn + '/' + this.settings.league_versions.value.profileicon + '/img/profileicon/' + this.summoner.icon_id + '.png'
			},
			name() {
				return this.summoner.name
			},
			region() {
				return this.summoner.region
			}
		},
		props: {
			settings: Object,
			summoner: Object
		}
	}
</script>