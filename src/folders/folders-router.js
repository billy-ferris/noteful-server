const express = require('express')
const path = require('path')
const FoldersService = require('./folders-service')

const foldersRouter = express()
const jsonParser = express.json()

foldersRouter
    .route('/')
    .get((req, res, next) => {
        FoldersService.getAllFolders(req.app.get('db'))
        .then(folders => {
            res.json(folders)
        })
        .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { folder_name } = req.body
        const newFolder = { folder_name }
        if (!folder_name) {
            return res.status(400).json({
                error: { message: `Missing 'folder_name' in request body` }
            })
        }
        FoldersService.insertFolder(
            req.app.get('db'),
            newFolder
        )
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${folder.id}`))
                    .json(folder)
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .get((req, res, next) => {
        FoldersService.getById(
            req.app.get('db'),
            req.params.folder_id
        )
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                    })
                }
                res.json(folder)
            })
            .catch(next)
    })

module.exports = foldersRouter