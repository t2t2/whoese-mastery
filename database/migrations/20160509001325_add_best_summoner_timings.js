export async function up(knex) {
	await knex('settings').insert({
		key: 'timings',
		value: JSON.stringify({
			bestSummoner: {
				question: 15,
				answer: 10
			}
		})
	})
}

export async function down(knex) {
	await knex('settings').where('key', 'timings').del()
}
