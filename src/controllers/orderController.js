const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const {isValid,isValidRequestBody} = require('../validation/validator');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const placeOrder = async (req,res) => {
    try{

    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const cancelOrder = async (req,res) => {
    try{

    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

module.exports = {
    placeOrder,
    cancelOrder
}