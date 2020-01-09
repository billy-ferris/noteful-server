const express = require('express')
const path = require('path')
const NotesService = require('./notes-service')

const notesRouter = express()
const jsonParser = express.json()

notesRouter
    .route('/')
    .get((req, res, next) => {
        NotesService.getAllNotes(req.app.get('db'))
        .then(notes => {
            res.json(notes)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { note_name, content, folder_id } = req.body
        const newNote = { note_name, content, folder_id }
        
        for (const [key, value] of Object.entries(newNote)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        NotesService.insertNote(
            req.app.get('db'),
            newNote
        )
            .then(note => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${note.id}`))
                    .json(note)
            })
            .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        NotesService.getById(
            req.app.get('db'),
            req.params.note_id
        )
            .then(notes => {
                if (!notes) {
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                    })
                }
                res.notes = notes
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.notes)
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(
            req.app.get('db'),
            req.params.note_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { note_name, content, folder_id } = req.body
        const noteToUpdate = { note_name, content, folder_id }

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: { message: `Request body must contain 'note_name', and 'folder_id'` }
            })
        }

        NotesService.updateNote(
            req.app.get('db'),
            req.params.note_id,
            noteToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = notesRouter