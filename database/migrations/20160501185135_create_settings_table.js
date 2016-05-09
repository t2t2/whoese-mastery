export async function up(knex) {
	await knex.schema.createTable('settings', table => {
		table.string('key', 100).primary()
		table.json('value')
	})
}

export async function down(knex) {
	await knex.schema.dropTable('settings')
}
