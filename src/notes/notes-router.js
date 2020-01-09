const express = require('express')
const NotesService = require('./notes-service')

const notesRouter = express()

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
    })

module.exports = notesRouter