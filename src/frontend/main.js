import Vue from 'vue'
import VueRouter from 'vue-router'
import VueSyncersFeathers from 'vue-syncers-feathers'

if (process.env.NODE_ENV !== 'production') {
	Vue.config.debug = true
}

Vue.use(VueRouter)

import feathers from './feathers'

// For ease of use
Vue.prototype.$feathers = feathers
Vue.prototype.$service = function (name) {
	return feathers.service(name)
}

Vue.use(VueSyncersFeathers, {
	driverOptions: {
		feathers: feathers
	}
})

// Set up router
import routes from './router'
import App from './App.vue'

const router = new VueRouter({
	history: true
})

router.map(routes)

router.start(App, '#app', () => {
	if (process.env.NODE_ENV !== 'production') {
		global.router = router
		global.app = router.app
	}
})
