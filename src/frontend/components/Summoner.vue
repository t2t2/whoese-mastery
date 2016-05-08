<template>
	<div class="summoner">
		<figure v-if="show.indexOf('icon') !== -1" class="image summoner__image">
			<img :src="icon" />
		</figure>
		<div v-if="show.indexOf('name') !== -1" class="summoner__name">
			{{name}}
			<span class="summoner__region" v-text="region"></span>
		</div>
	</div>
</template>

<script>

	export default {
		computed: {
			icon() {
				if(this.settings && this.settings.league_versions) {
					return this.settings.league_versions.value.cdn + '/' + this.settings.league_versions.value.profileicon + '/img/profileicon/' + this.summoner.icon_id + '.png'
				}
			},
			name() {
				return this.summoner.name
			},
			region() {
				return this.summoner.region
			}
		},
		props: {
			show: {
				type: Array,
				default() {
					return ['icon', 'name']
				}
			},
			settings: Object,
			summoner: {
				type: Object,
				required: true
			}
		}
	}
</script>