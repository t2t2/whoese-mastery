import _ from 'lodash'
import axios from 'axios'
import makeDebug from 'debug'

import * as errors from './errors'
import Limiter from './limiter'

const debug = makeDebug('league:api:util')

const regionInfo = {
	BR: {
		region: 'br',
		platform: 'BR1',
		host: 'br.api.pvp.net'
	},
	EUNE: {
		region: 'eune',
		platform: 'EUN1',
		host: 'eune.api.pvp.net'
	},
	EUW: {
		region: 'euw',
		platform: 'EUW1',
		host: 'euw.api.pvp.net'
	},
	JP: {
		region: 'jp',
		platform: 'JP1',
		host: 'jp.api.pvp.net'
	},
	KR: {
		region: 'kr',
		platform: 'KR',
		host: 'kr.api.pvp.net'
	},
	LAN: {
		region: 'lan',
		platform: 'LA1',
		host: 'lan.api.pvp.net'
	},
	LAS: {
		region: 'las',
		platform: 'LA2',
		host: 'las.api.pvp.net'
	},
	NA: {
		region: 'na',
		platform: 'NA1',
		host: 'na.api.pvp.net'
	},
	OCE: {
		region: 'oce',
		platform: 'OC1',
		host: 'oce.api.pvp.net'
	},
	TR: {
		region: 'tr',
		platform: 'TR1',
		host: 'tr.api.pvp.net'
	},
	RU: {
		region: 'ru',
		platform: 'RU',
		host: 'ru.api.pvp.net'
	},
	PBE: {
		region: 'pbe',
		platform: 'PBE1',
		host: 'pbe.api.pvp.net'
	}
}

export default class LeagueAPIUtils {
	constructor(core, limits) {
		this.core = core
		this.limiter = new Limiter(core, limits)
	}

	/**
	 * Get info for a region
	 */
	getRegionInfo(region) {
		if (region in regionInfo) {
			return regionInfo[region]
		}
		throw new Error('Invalid Region')
	}

	/**
	 * check cache for response before getting fresh version
	 */
	checkForCachedResponse(request, cacheDuration, freshDataGetter) {
		const key = 'service.league.request:' + JSON.stringify(request)

		return this.core.cache.remember(key, cacheDuration, () => {
			debug('cache miss', key)

			return freshDataGetter()
		}).then(response => {
			// Make a copy of response to avoid mucking with cache with mutations (esp. memory based ones)
			return _.cloneDeep(response)
		})
	}

	/**
	 * Make request that follows rate limiting rules
	 */
	makeRateLimitedRequest(request) {
		const region = request.region

		return this.limiter.schedule(region).then(async () => {
			await this.limiter.usesRateLimit(region)

			return this._doActualRequest(request)
		})
	}

	makeNonlimitedRequest(request) {
		return this._doActualRequest(request)
	}

	_doActualRequest(request) {
		const axiosRequest = this.createRequestObject(request)

		return axios(axiosRequest).then(response => {
			return response.data
		}).catch(response => {
			switch (response.status) {
				case 404: {
					// Not found
					let message = null
					if (_.has(response, 'data.status.message')) {
						message = _.get(response, 'data.status.message')
					}

					throw new errors.NotFound(message, response.data)
				}
				default: {
					console.log(axiosRequest, response)
					throw response
				}
			}
		})
	}

	createRequestObject(request) {
		const regionInfo = this.getRegionInfo(request.region)

		let url = request.url
		let query = request.query
		// Replace placeholders
		const used = []
		url = url.replace(/\{(\w+)\}/g, (match, path) => {
			if (path in regionInfo) {
				return regionInfo[path]
			}
			if (path in query) {
				let value = query[path]
				used.push(path)
				if (Array.isArray(value)) {
					value = value.join(',')
				}
				return encodeURIComponent(value)
			}
		})
		const params = _({}).assign(_.omit(query, used), {
			api_key: this.core.key // eslint-disable-line camelcase
		}).mapValues((value) => {
			if (Array.isArray(value)) {
				return value.join(',')
			}
			return value
		}).value()

		const axiosRequest = {
			url,
			method: request.method || 'GET',
			baseURL: 'https://' + (request.host ? request.host : regionInfo.host),
			params,
			responseType: 'json'
		}

		return axiosRequest
	}
}
