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
	},
	'create': {
		name: 'create-game',
		component(resolve) {
			System.import('./routes/CreateGame.vue').then(resolve)
		}
	},
	'login': {
		name: 'login',
		component(resolve) {
			System.import('./routes/Login.vue').then(resolve)
		}
	},
	'room/:room_id': {
		name: 'room',
		component(resolve) {
			System.import('./routes/Room.vue').then(resolve)			
		}
	},
	'*': {
		name: '404',
		component(resolve) {
			System.import('./routes/404.vue').then(resolve)
		}
	}
}
