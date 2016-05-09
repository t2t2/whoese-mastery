export async function up(knex) {
	await knex.schema.createTable('rooms', table => {
		table.increments('id')
		table.string('join_code', 32).unique()
		table.timestamps()
	})
}

export async function down(knex) {
	await knex.schema.dropTable('rooms')
}
