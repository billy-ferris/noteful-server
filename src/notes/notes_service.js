const NotesService = {
    getAllnotes(knex) {
        return knex
            .select('*')
            .from('noteful_notes')
    },
    insertnote(knex, newNote) {
        return knex
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex('noteful_notes')
            .select('*')
            .where('id', id)
            .first()
    },
    deletenote(knex, id) {
        return knex('noteful_notes')
            .where({ id })
            .delete()
    },
    updatenote(knex, id, newNoteFields) {
        return knex('noteful_notes')
            .where({ id })
            .update(newNoteFields)
    },
}

module.exports = NotesService