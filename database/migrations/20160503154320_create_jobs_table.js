export async function up(knex) {
	await knex.schema.createTable('jobs', table => {
		table.increments('id')
		table.string('queue')
		table.string('name')
		table.json('payload')
		table.integer('attempts')
		table.boolean('reserved')
		table.timestamp('reserved_at').nullable()
		table.timestamp('available_at')
		table.timestamp('created_at')

		table.index(['queue', 'reserved', 'reserved_at'])
	})
}

export async function down(knex) {
	await knex.schema.dropTable('jobs')
}
