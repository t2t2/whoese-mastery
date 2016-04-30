import {
	caching
} from 'cache-manager'

const cache = caching({
	store: 'memory',
	max: 1000,
	ttl: 10
})

// Small layer that uses api covnentions from laravel
export default {
	async get(key) {
		return cache.get(key)
	},

	async has(key) {
		return Boolean(this.get(key))
	},

	async put(key, value, seconds) {
		return cache.set(key, value, {
			ttl: seconds
		})
	},

	async remember(key, seconds, getter) {
		return cache.wrap(key, getter, {
			ttl: seconds
		})
	}
}
