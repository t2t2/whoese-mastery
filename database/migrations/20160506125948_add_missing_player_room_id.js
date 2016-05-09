export async function up(knex) {
	await knex.schema.table('players', table => {
		table.integer('room_id').unsigned().references('id').inTable('rooms').onUpdate('CASCADE').onDelete('CASCADE')
	})
}

export async function down(knex) {
	await knex.schema.table('players', table => {
		table.dropColumn('room_id')
	})
}
