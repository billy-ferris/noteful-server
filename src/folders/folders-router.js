const express = require('express')
const FoldersService = require('./folders-service')

const foldersRouter = express()

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
        .then(folders => {
            res.json(folders)
        })
        .catch(next)
    })

module.exports = foldersRouter