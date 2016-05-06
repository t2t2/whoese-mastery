<template>
	<div class="summoner">
		<figure class="image summoner__image">
			<img :src="icon" />
		</figure>
		<div class="summoner__name">
			{{name}}
			<span class="summoner__region" v-text="region"></span>
		</div>
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