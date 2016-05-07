export default class Job {
	constructor(manager, job) {
		this.manager = manager
		this.job = job

		this.payload = JSON.parse(job.payload)

		this.deleted = false
		this.released = false

		this.job.attempts++
	}

	get id() {
		return this.job.id
	}

	get queue() {
		return this.job.queue
	}

	get name() {
		return this.job.name
	}

	get attempts() {
		return this.job.attempts
	}

	handled() {
		return this.deleted || this.released
	}

	async del() {
		if (this.handled()) {
			return
		}

		this.deleted = true
		return this.manager.deleteJob(this)
	}

	/**
	 * Release job back to the queue with delay
	 */
	async release(delay) {
		if (this.handled()) {
			return
		}

		this.released = true
		return this.manager.releaseJob(this, delay)
	}
}
