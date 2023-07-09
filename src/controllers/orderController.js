const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const {isValid,isValidRequestBody} = require('../validation/validator');
const mongoose = require('mongoose');
const orderModel = require('../models/orderModel');
const ObjectId = mongoose.Types.ObjectId

const placeOrder = async (req,res) => {
    try{
        let {userId} = req.params
        if(!isValid(userId) || !ObjectId.isValid(userId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid userId"
            })
        }
        
        let user  = await userModel.findById(userId)
        if(!user){
            return res.status(400).send({
                status :false,
                message: "User Not exist"
            })
        }
    
        if(userId != req.userId){
            return res.status(403).send({
                status: false,
                message: "unauthorized User"
            })
        }

        let cart = await cartModel.findOne({userId:userId})
        if(!cart){
            return res.status(404).send({
                status :false,
                message: "Cart Not exist"
            })
        }
        if(!cart.items.length > 0){
            return res.status(404).send({
                status :false,
                message: "Add product in cart"
            })
        }

        let totalQuantity =0
        for(let i=0; i<cart.items.length; i++){
            totalQuantity += cart.items[i].quantity
        }
        let order = {
            items : cart.items,
            userId : userId,
            totalPrice : cart.totalPrice,
            totalItems : cart.totalItems,
            totalQuantity : totalQuantity
        }

        let {cancellable,status} = req.body

        if(cancellable && isValid(cancellable)){
            order.cancellable = cancellable
        }

        if(status){
            if(['pending','completed','canceled'].includes(status)){
                order.status = status
            }
            else{
                return res.status(400).send({
                    status :false,
                    message: "add valid status"
                })
            }
        }

        let orderData = await orderModel.create(order)

        res.status(201).send({
            status: true,
            message: "your order placed",
            data : orderData
        })


    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const cancelOrder = async (req,res) => {
    try{
        let {userId} = req.params
        if(!isValid(userId) || !ObjectId.isValid(userId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid userId"
            })
        }
        
        let user  = await userModel.findById(userId)
        if(!user){
            return res.status(400).send({
                status :false,
                message: "User Not exist"
            })
        }
    
        if(userId != req.userId){
            return res.status(403).send({
                status: false,
                message: "unauthorized User"
            })
        }

        if(!isValidRequestBody(req.body)){
            return res.status(400).send({
                status :false, message: "Must add data"
            })
        }
        let {orderId} = req.body
        if(!isValid(orderId) || !ObjectId.isValid(orderId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid orderId"
            })
        }
        let orderDetails = await orderModel.findById(orderId)
        // console.log(orderDetails)
        if(!orderDetails || orderDetails.isDeleted == true){
            return res.status(404).send({
                status: false,
                message: "Order not found"
            })
        }
        if(orderDetails.cancellable == false){
            return res.status(403).send({
                status: false,
                message: "You can not cancel order"
            })
        }

        orderDetails.status = "canceled"
        // orderDetails.isDeleted = true
        // orderDetails.deletedAt = Date.now()

        await orderDetails.save()

        res.status(200).send({
            status: true,
            message:" order canceled"
        })
        
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