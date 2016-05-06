export async function up(knex) {
	await knex('settings').insert({
		key: 'limits',
		value: JSON.stringify({
			players: 10
		})
	})
}

export async function down(knex) {
	await knex('settings').where('key', 'settings').del()
}
