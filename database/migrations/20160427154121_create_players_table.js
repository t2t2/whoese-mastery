export async function up(knex) {
	await knex.schema.createTable('players', table => {
		table.increments('id')
		table.timestamps()
	})

	await knex.schema.table('rooms', table => {
		table.integer('owner_player_id').unsigned().references('id').inTable('players').onUpdate('CASCADE').onDelete('SET NULL')
	})

	await knex.schema.table('sessions', table => {
		table.integer('player_id').unsigned().nullable().references('id').inTable('players').onUpdate('CASCADE').onDelete('SET NULL')
	})
}

export async function down(knex) {
	await knex.schema.table('sessions', table => {
		table.dropForeign('player_id')
		table.dropColumn('player_id')
	})

	await knex.schema.table('rooms', table => {
		table.dropForeign('owner_player_id')
		table.dropColumn('owner_player_id')
	})

	await knex.schema.dropTable('players')
}
