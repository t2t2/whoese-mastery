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
					<a class="header-item" v-link="{name: 'home'}">Home</a>
					<a class="header-item" v-link="{name: 'about'}">About</a>
				</div>
				<div class="header-toggle" @click="toggleMenu">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</header>
		
		<div class="layout__content">
			<router-view></router-view>
		</div>
		
		<footer class="footer">
			<div class="container">
				<div class="content">
					<p><span class="tag is-danger">TODO: FILL THIS</span> Footer and legal stuff</p>
				</div>
			</div>
		</footer>
	</div>
</template>

<script>

	export default {
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
		}
	}
</script>