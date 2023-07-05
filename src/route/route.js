const express = require('express')
const router = express.Router()

const {authorize} = require('../middleware/auth')
const {createUser, userLogin, getUser, updateUser} = require('../controllers/usercontroller')

router.post('/register',createUser)
router.post('/login',userLogin)
router.get('/user/:userId/profile',authorize,getUser)
router.put('/user/:userId/profile',authorize,updateUser)





router.all('*', async (req, res) => {
    return res.status(404).send({status: false, message: "invalid url"})
})
module.exports = router