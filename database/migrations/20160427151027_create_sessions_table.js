export async function up(knex) {
	await knex.schema.createTable('sessions', table => {
		table.increments('id')
		table.timestamps()
	})
}

export async function down(knex) {
	await knex.schema.dropTable('sessions')
}
