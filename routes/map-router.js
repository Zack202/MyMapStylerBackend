const express = require('express')
const MapController = require('../controllers/map-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/createNewMap',auth.verify, MapController.createNewMap)

module.exports = router