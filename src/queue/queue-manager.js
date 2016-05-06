import _ from 'lodash'
import makeDebug from 'debug'
import moment from 'moment'

import Job from './job'

const debug = makeDebug('feathers-queue')

export default class QueueManager {
	constructor({
		app,
		service,
		queues = ['default'],
		expires = moment.duration(30, 'seconds')
	}) {
		this.app = app
		this.service = app.service(service)
		this.queues = queues
		this.expires = expires

		// To avoid races get direct knex connection
		this.knex = this.service.knex
		this.table = this.service.table

		this.jobs = {}
		this.working = 0
		this.maxWorking = 1 // Can be increased once confident
		this.passiveListenerFrequency = moment.duration(30, 'seconds')
		this.passiveListenerInterval = null

		// Register job listener once server is set up
		const queue = this
		const _super = app.setup
		app.setup = function () {
			let result = _super.apply(this, arguments)

			queue.registerListener()

			return result
		}
	}

	/**
	 * Push a job to the queue to do it
	 */
	async push(name, payload, queue) {
		return this._storeNewJob({
			queue,
			name,
			payload,
			available: moment().toDate()
		})
	}

	/**
	 * Push a job to the queue to do it later
	 */
	async later(when, name, payload, queue) {
		if (typeof when === 'number') {
			when = moment.duration(when, 'seconds')
		}
		if (moment.isDuration(when)) {
			when = moment().add(when)
		}
		if (!moment.isMoment(when)) {
			when = moment(when)
		}

		return this._storeNewJob({
			queue,
			name,
			payload,
			available: when.toDate()
		})
	}

	/**
	 * Register jobs onto the queue manager
	 */
	registerJobs(newJobs) {
		_.assign(this.jobs, newJobs)
	}

	/**
	 * Run a passive checker, see bellow
	 */
	registerListener() {
		this.passiveListenerInterval = setInterval(() => {
			this.passiveChecker()
		}, this.passiveListenerFrequency.asMilliseconds())

		this.passiveChecker()
	}

	/**
	 * Passive checker for jobs that don't get added via events and on boot
	 */
	async passiveChecker() {
		await this.releaseTimedOut()

		if (!this.working) {
			debug('passive checking for available jobs')

			await this.doNextJob()
		}
	}

	/**
	 * Do next job that can be done
	 */
	async doNextJob() {
		if (this.working >= this.maxWorking) {
			return
		}

		let gotWork = false
		try {
			gotWork = Boolean(await this.pop())
		} catch (e) {
			console.log(e)
		}

		if (gotWork) {
			// TODO: Allow more than 1 job at a time
		}
	}

	/**
	 * Do next job available in the queue
	 */
	async pop() {
		if (this.working >= this.maxWorking) {
			return
		}

		// Get next job
		const job = await this.knex.transaction(async (trx) => {
			try {
				const job = await this.getNextAvailableJob(trx)

				if (job) {
					debug('Got job', job.id)

					await this.reserveJob(trx, job.id)
				}

				return job
			} catch (e) {
				debug("Couldn't reserve job", e)
				throw e
			}
		})

		if (job) {
			this.working++

			const onJobDone = () => {
				this.working--
				// check if there's more jobs now
				this.doNextJob()
			}

			// Can be done off-thread
			this.doJob(job).then(onJobDone).catch((error) => {
				debug('Error running job', error)

				onJobDone()
			})
		}

		return job
	}

	/**
	 * Get the next available job
	 *
	 * To ensure avoiding races use knex directly if it's on the service
	 */
	async getNextAvailableJob(trx) {
		return await this.knex(this.table).transacting(trx).forUpdate()
			.whereIn('queue', this.queues)
			.where('reserved', false)
			.where('available_at', '<=', moment().toDate())
			.orderBy('id', 'asc')
			.first()
	}

	/**
	 * Reserves a job
	 */
	async reserveJob(trx, id) {
		return await this.knex(this.table).transacting(trx)
			.where('id', id)
			.update({
				reserved: true,
				reserved_at: moment().toDate() // eslint-disable-line camelcase
			})
	}

	/**
	 * Do the job
	 */
	async doJob(jobData) {
		const job = new Job(this, jobData)

		const jobWorker = this.jobs[jobData.name]

		if (!jobWorker) {
			debug('Missing job', jobData.name)
			await job.release(moment.duration(1, 'minutes'))
			return
		}

		try {
			await jobWorker.handle.call(this.app, job)
		} catch (e) {
			job.release(moment.duration(10, 'seconds'))
			throw e
		}

		// Success
		// Don't reschedule if already marked for release/delete
		if (!job.handled()) {
			if (jobWorker.repeating) {
				debug('Repeating done job', job.id)
				await this.repeatJob(job, jobWorker.repeating)
			} else {
				debug('Removing done job', job.id)
				await job.delete()
			}
		}
	}

	/**
	 * Release timed out jobs
	 */
	async releaseTimedOut() {
		debug('releasing timed out jobs')

		await this.knex(this.table)
			.whereIn('queue', this.queues)
			.where('reserved', true)
			.where('reserved_at', '<=', moment().subtract(this.expires).toDate())
			.update({
				reserved: false,
				reserved_at: null, // eslint-disable-line camelcase
				attempts: this.knex.raw('attempts + 1')
			})
	}

	/**
	 * Removes current job and re-makes it with some delay
	 */
	async releaseJob(job, delay = null) {
		return this.service.patch(job.id, {
			attempts: job.attempts,
			reserved: false,
			/* eslint-disable camelcase */
			reserved_at: null,
			available_at: this.getDelayedTime(delay).toDate()
			/* eslint-enable camelcase */
		})
	}

	/**
	 * Repeats a job after some time
	 */
	async repeatJob(job, delay) {
		return this.service.patch(job.id, {
			attempts: 0,
			reserved: false,
			/* eslint-disable camelcase */
			reserved_at: null,
			available_at: this.getDelayedTime(delay).toDate()
			/* eslint-enable camelcase */
		})
	}

	/**
	 * Deletes a job
	 */
	async deleteJob(job) {
		await this.service.remove(job.id)
	}

	/**
	 * Get time that should be delayed
	 */
	getDelayedTime(delay) {
		if (!delay) {
			return moment()
		}

		if (typeof delay === 'number') {
			delay = moment.duration(delay, 'seconds')
		}

		return moment().add(delay)
	}

	/**
	 * Store new job in database
	 */
	async _storeNewJob(data) {
		return this.service.create({
			queue: data.queue || this.queues[0],
			name: data.name,
			payload: JSON.stringify(data.payload),
			attempts: 0,
			reserved: false,
			/* eslint-disable camelcase */
			reserved_at: null,
			available_at: data.available,
			created_at: moment().toDate()
			/* eslint-enable camelcase */
		})
	}
}
