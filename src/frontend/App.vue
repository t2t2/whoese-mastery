<template>
	<div class="layout__wrapper">
		<header class="header">
			<div class="container">	
				<div class="header-brand">
					<div class="header-item">
						<h1 class="subtitle">Whose Mastery Is It Anyway?</h1>
					</div>
				</div>
				<div class="header-left header-menu" :class="{'is-active': showMenu}">
					<a class="header-item" v-link="{name: 'home', exact: true, activeClass: 'is-active'}">Home</a>
					<a class="header-item" v-link="{name: 'about', activeClass: 'is-active'}">About</a>
				</div>
				<div class="header-toggle" @click="toggleMenu">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<div class="header-right">
					<summoner
						:settings="settings"
						:summoner="connection.user.summoner"
						class="header-item"
						v-if="connection.user">
					</summoner>
				</div>
			</div>
		</header>
		
		<div class="connection fast" v-if="!connection.connected" transition="slide-up-fade">
			<p v-text="connection.reason"></p>
		</div>
		
		<div class="layout__content">
			<router-view
				transition="scale-up"
				transition-mode="out-in"
				class="fast"
				v-ref:page
				:connection="connection"
				:settings="settings">
			</router-view>
		</div>
		
		<footer class="footer">
			<div class="container">
				<div class="content">
					<p>Whose Mastery Is It Anyway? isn’t endorsed by Riot Games and doesn’t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>
	import Summoner from './components/Summoner.vue' 

	import connectionMixin from './mixins/connection'

	let defaultSettings = {}

	const entryElement = document.getElementById('script-entry')
	if (entryElement) {
		const settingsString = entryElement.getAttribute('data-settings')
		if (settingsString) {
			defaultSettings = JSON.parse(settingsString)
		}
	}

	export default {
		mixins: [connectionMixin],
		components: {
			Summoner
		},
		computed: {
			settings() {
				if (Object.keys(this.settingsData).length) {
					return this.settingsData
				} else {
					return defaultSettings
				}
			}
		},
		data() {
			return {
				// Toggle menu (on mobile)
				showMenu: false
			}
		},
		methods: {
			toggleMenu() {
				this.showMenu = !this.showMenu
			}
		},
		sync: {
			settingsData: {
				service: 'api/settings',
				idField: 'key'
			}
		}
	}
</script>