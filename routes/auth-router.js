const express = require('express')
const router = express.Router()
const AuthController = require('../controllers/auth-controller')

router.post('/register/', AuthController.registerUser)
router.post('/login/', AuthController.loginUser)
router.get('/logout/', AuthController.logoutUser)
router.get('/loggedIn/', AuthController.getLoggedIn)
router.post('/forgotPassword/', AuthController.forgotPassword)
router.patch('/resetPassword/:token', AuthController.resetPassword)
router.get('/deleteUser/', AuthController.deleteUser)
router.put('/profile/:id', AuthController.updateUserInfo)


module.exports = router