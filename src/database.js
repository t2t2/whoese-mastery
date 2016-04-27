import _ from 'lodash'
import knex from 'knex'
import parseConnectionString from 'knex/lib/util/parse-connection'

import config from './config'

let connectionOptions = config.get('database.options')

if (config.has('database.url') && config.get('database.url')) {
	_.assign(connectionOptions, parseConnectionString(config.get('database.url')))
}

export default knex(connectionOptions)
