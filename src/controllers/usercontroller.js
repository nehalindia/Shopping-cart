const userModel = require('../models/userModel')
const validator = require('validator');
const {isValid,isValidRequestBody} = require('../validation/validator');
require('dotenv').config

const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")


const createUser = async function(req,res){
    let files = req.files
    console.log(files)
    console.log(req.body)
    console.log(req.headers.authorization)
    try{

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }

}

module.exports = {
    createUser
}
