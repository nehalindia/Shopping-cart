const userModel = require('../models/userModel')
const validator = require('validator');
const {isValid,isValidRequestBody} = require('../validation/validator');
require('dotenv').config
const aws = require("aws-sdk")
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")


const createUser = async function(req,res){
    let files = req.files
    console.log(files)
    let {data, name}= req.body
    console.log(data,name)
    console.log("createUser")
    res.send({msg : req.body})
    try{

    }catch(error){
        res.status(500).send({status : false, message : error.message})
    }

}

module.exports = {
    createUser
}
