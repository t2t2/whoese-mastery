<template>
	<div class="champion">
		<figure v-if="show.indexOf('icon') !== -1" class="image champion__image">
			<img :src="icon" />
		</figure>
		<div v-if="show.indexOf('name') !== -1" class="champion__name">
			{{name}}
		</div>
	</div>
</template>

<script>

	export default {
		computed: {
			champion() {
				return this.champions[this.championId]
			},
			icon() {
				if(this.champion && this.settings && this.settings.league_versions) {
					return this.settings.league_versions.value.cdn + '/' + this.settings.league_versions.value.champion + '/img/champion/' + this.champion.key + '.png'
				}
			},
			name() {
				return this.champion.name
			},
		},
		props: {
			show: {
				type: Array,
				default() {
					return ['icon', 'name']
				}
			},
			settings: Object,
			champions: {
				type: Object,
				required: true
			},
			championId: {
				type: Number,
				required: true
			}
		}
	}
</script>