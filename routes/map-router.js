const express = require('express')
const MapController = require('../controllers/map-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/name/:name', MapController.createNewName)
router.get('/names', MapController.getNames)

module.exports = router