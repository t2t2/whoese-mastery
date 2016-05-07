
export async function up(knex) {
	await knex.schema.table('rooms', table => {
		table.string('state')
	})
}

export async function down(knex) {
	await knex.schema.table('rooms', table => {
		table.dropColumn('state')
	})
}
