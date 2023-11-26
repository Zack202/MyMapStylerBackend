const express = require('express')
const MapController = require('../controllers/map-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/createNewMap',auth.verify, MapController.createNewMap)
router.put('/updateMap/:id',auth.verify, MapController.updateMap)
router.get('/mapPairs', auth.verify, MapController.getMapPairs)

module.exports = router