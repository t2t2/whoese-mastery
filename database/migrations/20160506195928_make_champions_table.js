
export async function up(knex) {
	await knex.schema.createTable('champions', table => {
		table.integer('id').primary()
		table.string('key')
		table.string('name')
	})
}

export async function down(knex) {
	await knex.schema.dropTable('champions')
}
