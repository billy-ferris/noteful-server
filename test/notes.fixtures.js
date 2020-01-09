function makeNotesArray() {
    return [
        {
            id: 1,
            content: 'Lorem ipsum test content',
            note_name: 'Important',
            folder_id: 1,
            modified:'2020-01-09T08:17:24.547Z'
        },
        {
            id: 2,
            content: 'Lorem ipsum test content',
            note_name: 'Super',
            folder_id: 1,
            modified: '2020-01-09T08:17:24.547Z'
        },
        {
            id: 3,
            content: 'Lorem ipsum test content',
            note_name: 'Spangley',
            folder_id: 2,
            modified: '2020-01-09T08:17:24.547Z'
        },
        {
            id: 4,
            content: 'Lorem ipsum test content',
            note_name: 'Lorem',
            folder_id: 3,
            modified: '2020-01-09T08:17:24.547Z'
        }
    ]
}

module.exports = {
    makeNotesArray
}