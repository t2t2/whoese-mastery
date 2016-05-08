
export async function up(knex) {
	await knex.schema.table('players', table => {
		table.integer('score')
	})
}

export async function down(knex) {
	await knex.schema.table('players', table => {
		table.dropColumn('score')
	})
}
