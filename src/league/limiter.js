import _ from 'lodash'
import Limitus from 'limitus'
import makeDebug from 'debug'

const debug = makeDebug('league:api:limiter')

export default class LeagueAPILimiter {
	constructor(core, limits) {
		this.core = core

		// Set up limiter
		const limiter = this.limiter = new Limitus()

		// Hook up to cache
		limiter.extend({
			set: (key, value, expiration, callback) => {
				this.core.cache.put(key, value, expiration / 1000).then(() => {
					callback()
				}, error => {
					callback(error)
				})
			},
			get: (key, callback) => {
				this.core.cache.get(key).then(result => {
					callback(null, result)
				}, error => {
					callback(error)
				})
			}
		})

		this.limitBuckets = _.map(limits, (limit, index) => {
			const ruleName = 'api' + (index + 1)

			limiter.rule(ruleName, {
				mode: 'interval',
				interval: limit.interval * 1000,
				max: limit.max
			})

			return ruleName
		})

		// queue of jobs to run
		this.limitQueue = {}
		// in case any rate limits from server were recieved
		this.nextAllowed = {}
		// setTimeouts to work out the queue
		this.limitQueueTimeouts = {}
	}

	/**
	 * Get a promise of when it's ok to get do next request (rate limiting)
	 */
	async schedule(region = 'NA') {
		try {
			if (this.limitQueue[region] && this.limitQueue[region].length) {
				throw new Error('Queue is in place')
			}

			await this.passesRateLimits(region)

			return true
		} catch (e) {
			debug('Request scheduled for later', region)
			return this.queue(region)
		}
	}

	/**
	 * Pre-test to see if there's room to make the request
	 */
	async passesRateLimits(region) {
		return Promise.all(_.map(this.limitBuckets, (bucket) => {
			return this.limiter.checkLimited(bucket, {
				region
			})
		}))
	}

	/**
	 * Use a rate limit charge
	 */
	async usesRateLimit(region) {
		return Promise.all(_.map(this.limitBuckets, (bucket) => {
			return this.limiter.drop(bucket, {
				region
			})
		}))
	}

	/**
	 * Queue up a request for later and get a promise that is resolved when it's time
	 */
	queue(region) {
		if (!this.limitQueue[region]) {
			this.limitQueue[region] = []
		}

		return new Promise(resolve => {
			this.limitQueue[region].push(resolve)

			if (!this.limitQueueTimeouts[region]) {
				this.limitQueueTimeouts[region] = setTimeout(() => {
					this.workQueue(region)
				}, this.nextAllowed[region] || 1000)
			}
		})
	}

	/**
	 * Work queue handler
	 */
	async workQueue(region) {
		// Clear timeout reference
		if (region in this.limitQueueTimeouts) {
			delete this.limitQueueTimeouts[region]
		}

		// Check if there's work to do
		if (this.limitQueue[region] && this.limitQueue[region].length) {
			// Check if a work can be done
			try {
				if (this.nextAllowed[region]) {
					if (this.nextAllowed[region] > Date.now()) {
						throw new Error('Too early')
					} else {
						delete this.nextAllowed[region]
					}
				}

				await this.passesRateLimits(region)

				// No fail = GTG
				const work = this.limitQueue[region].shift()

				work(true)

				// check if work left
				if (this.limitQueue[region].length) {
					this.limitQueueTimeouts[region] = setTimeout(() => {
						this.workQueue(region)
					}, 1)
				}
			} catch (e) {
				debug('Waiting more', region, e)

				// Not yet
				this.limitQueueTimeouts[region] = setTimeout(() => {
					this.workQueue(region)
				}, this.nextAllowed[region] || 1000)
				return
			}
		}
	}
}
