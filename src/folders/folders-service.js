const FoldersService = {
    getAllFolders(knex) {
        return knex
            .select('*')
            .from('noteful_folders')
    },
    insertFolder(knex, newFolder) {

    },
    getById(knex, id) {

    },
    deleteFolder(knex, id) {
        
    },
    updateFolder(knex, id, newFolderFields) {

    },
}

module.exports = FoldersService