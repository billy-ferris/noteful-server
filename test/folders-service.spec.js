const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeFoldersArray } = require('./folders.fixtures')

describe.only('Folders Endpoints', () => {
    let db

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    afterEach('cleanup', () => db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE'))

    describe(`GET /api/folders endpoint`, () => {
        context(`Given no folders`, () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, [])
            })
        })

        context(`Given there are folders are in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it('GET /api/folders responds with 200 and all of the folders', () => {
                return supertest(app)
                    .get('/api/folders')
                    .expect(200, testFolders)
            })
        })
    })

    describe(`GET /api/folders/:folder_id endpoint`, () => {
        context(`Given no folders`, () => {
            it(`responds with 404`, () => {
                const folderId = 123456
                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(404, {
                        error: { message: `Folder doesn't exist` }
                    })
            })
        })

        context(`Given there are folders in the database`, () => {
            const testFolders = makeFoldersArray()

            beforeEach('insert folders', () => {
                return db
                    .into('noteful_folders')
                    .insert(testFolders)
            })

            it(`responds with 200 and expected folder`, () => {
                const folderId = 2
                const expectedFolder = testFolders[folderId - 1]

                return supertest(app)
                    .get(`/api/folders/${folderId}`)
                    .expect(200, expectedFolder)
            })
        })
    })

    describe.only(`POST /api/folders endpoint`, () => {
        it('creates a folder, responding with 201 and the new folder', () => {
            const newFolder = {
                folder_name: 'POST test folder'
            }
            return supertest(app)
                .post('/api/folders')
                .send(newFolder)
                .expect(201)
                .expect(res => {
                    expect(res.body.folder_name).to.eql(newFolder.folder_name)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
                })
                .then(postRes =>
                    supertest(app)
                        .get(`/api/folders/${postRes.body.id}`)
                        .expect(postRes.body)   
                )
        })
    })
})