import moment from 'moment'

export async function up(knex) {
	await knex('settings').insert({
		key: 'league_versions',
		value: JSON.stringify({
			// Default versions to older version to ensure it updates properly
			cdn: 'http://ddragon.leagueoflegends.com/cdn',
			champion: '6.1.1',
			profileicon: '6.1.1',
			item: '6.1.1',
			map: '6.1.1',
			mastery: '6.1.1',
			language: '6.1.1',
			summoner: '6.1.1',
			rune: '6.1.1',
			v: '6.1.1'
		})
	})

	await knex('jobs').insert({
		queue: 'default',
		name: 'updateLeagueVersion',
		attempts: 0,
		reserved: false,
		/* eslint-disable camelcase */
		reserved_at: null,
		available_at: 0,
		created_at: moment().toDate()
		/* eslint-enable camelcase */
	})
}

export async function down(knex) {
	await knex('jobs').where('name', 'updateLeagueVersion').del()

	await knex('settings').where('key', 'league_versions').del()
}
