export async function up(knex) {
	await knex.schema.createTable('rounds', table => {
		table.increments('id')
		table.integer('room_id').unsigned().references('id').inTable('rooms').onUpdate('CASCADE').onDelete('CASCADE')
		table.string('type')
		table.string('phase')
		table.json('round_info')
		table.json('answer_info')
		table.timestamp('start_time')
		table.timestamps()
	})

	await knex.schema.table('rooms', table => {
		table.integer('current_round_id').unsigned().nullable().references('id').inTable('rooms').onUpdate('CASCADE').onDelete('SET NULL')
	})
}

export async function down(knex) {
	await knex.schema.table('rooms', table => {
		table.dropColumn('current_round_id')
	})

	await knex.schema.dropTable('rounds')
}
