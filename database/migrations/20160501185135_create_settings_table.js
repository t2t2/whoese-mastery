export async function up(knex) {
	await knex.schema.createTable('settings', table => {
		table.string('key').primary()
		table.json('value')
	})
}

export async function down(knex) {
	await knex.schema.dropTable('settings')
}
