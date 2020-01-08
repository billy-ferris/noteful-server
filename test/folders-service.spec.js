const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

describe.only('Folders Endpoints', () => {
    let db

    let testFolders = [
        {
            folder_name: 'Important',
            id: 1
        },
        {
            folder_name: 'To Do',
            id: 2
        },
        {
            folder_name: 'Miscellaneous',
            id: 3
        }
    ];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    })

    after('disconnect from dv', () => db.destoy())

    before('clean the table', () => db('noteful_folders').truncate())

    afterEach('cleanup', () => db.raw('TRUNCATE blogful_articles, blogful_users, blogful_comments RESTART IDENTITY CASCADE'))
})