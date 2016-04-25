export default {
	'/': {
		name: 'home',
		component(resolve) {
			System.import('./routes/Home.vue').then(resolve)
		}
	},
	'about': {
		name: 'about',
		component(resolve) {
			System.import('./routes/About.vue').then(resolve)
		}
	}
}