process.env.TZ = 'UTC'
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeFoldersArray } = require('./folders.fixtures')

describe.only('Notes Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    beforeEach('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    describe(`GET /api/notes endpoint`, () => {
        context(`Given no notes`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, [])
            })
        })

        context(`Given there are notes are in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it('GET /api/notes responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes)
            })
        })
    })

    describe(`GET /api/notes/:note_id endpoint`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, {
                        error: { message: `Note doesn't exist` }
                    })
            })
        })

        context(`Given there are notes in the database`, () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it(`responds with 200 and expected note`, () => {
                const noteId = 2
                const expectedNote = testNotes[noteId - 1]

                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote)
            })
        })
    })

    describe(`POST /api/notes endpoint`, () => {
        const testFolders = makeFoldersArray()
        
        beforeEach('insert folders', () => {
            return db
                .into('noteful_folders')
                .insert(testFolders)
        })
        
        it('creates a note, responding with 201 and the new note', () => {
            const newNote = {
                note_name: 'POST test note',
                folder_id: 1,
                content: 'testing content desc...',
            }
            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name)
                    expect(res.body.content).to.eql(newNote.content)
                    expect(res.body.folder_id).to.eql(newNote.folder_id)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)
                    const expected = new Date().toLocaleString()
                    const actual = new Date(res.body.modified).toLocaleString()
                    expect(actual).to.eql(expected)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/notes/${postRes.body.id}`)
                        .expect(postRes.body)   
                )
        })

        const requiredFields = ['note_name', 'content', 'folder_id']

        requiredFields.forEach(field => {
            const newNote = {
                note_name: 'POST test note',
                folder_id: 1,
                content: 'testing content desc...'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newNote[field]

                return supertest(app)
                    .post('/api/notes')
                    .send(newNote)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body` }
                    })
            })
        })
    })

    describe(`DELETE /api/notes endpoint`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, {
                        error: { message: `Note doesn't exist` }
                    })
            })
        })

        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it('responds with 204 and removes the note', () => {
                const idToRemove = 2
                const expectedNotes = testNotes.filter(note => note.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/notes/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes`)
                            .expect(expectedNotes)
                    )
            })
        })
    })

    describe.only(`PATCH /api/notes endpoint`, () => {
        context(`Given no notes`, () => {
            it(`responds with 404`, () => {
                const noteId = 123456
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, {
                        error: { message: `Note doesn't exist` }
                    })
            })
        })

        context('Given there are notes in the database', () => {
            const testFolders = makeFoldersArray()
            const testNotes = makeNotesArray()

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
                    .then(() => {
                        return db
                            .into('noteful_notes')
                            .insert(testNotes)
                    })
            })

            it('responds with 204 and updates the note', () => {
                const idToUpdate = 4
                const updatedNote = {
                    note_name: 'updated name',
                }
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updatedNote
                }
                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send(updatedNote)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)    
                    )
            })
        })
    })
})