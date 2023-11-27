const express = require('express')
const MapController = require('../controllers/map-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/createNewMap',auth.verify, MapController.createNewMap)
router.put('/updateMap/:id',auth.verify, MapController.updateMap)
router.put('/updateMapFeatures/:id',auth.verify, MapController.updateMapFeatures) //not sure if diff will work in just update so made this
router.get('/mapPairs', auth.verify, MapController.getMapPairs)
router.get('/map/:id', auth.verify, MapController.getMapById)
router.get('/mapPairsPublished', auth.verify, MapController.getMapPairsPublished)
router.get('/removeMap/:id', auth.verify, MapController.removeMap)

module.exports = router