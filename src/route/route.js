const express = require('express')
const router = express.Router()

const {createUser} = require('../controllers/usercontroller')

router.post('/register',createUser)





router.all('*', async (req, res) => {
    return res.status(404).send({status: false, message: "invalid url"})
})
module.exports = router