export async function up(knex) {
	await knex.schema.createTable('round_answers', table => {
		table.increments('id')
		table.integer('round_id').unsigned().references('id').inTable('rounds').onUpdate('CASCADE').onDelete('CASCADE')
		table.integer('player_id').unsigned().references('id').inTable('players').onUpdate('CASCADE').onDelete('CASCADE')
		table.json('answer')
		table.timestamps()

		table.unique(['round_id', 'player_id'])
	})
}

export async function down(knex) {
	await knex.schema.dropTable('round_answers')
}
