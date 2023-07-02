const express = require('express')
const router = express.Router()





router.all('*', async (req, res) => {
    return res.status(404).send({status: false, message: "invalid url"})
})
module.exports = router