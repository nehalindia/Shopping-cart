const cartModel = require('../models/cartModel')
const userModel = require('../models/userModel')
const productModel = require('../models/productModel')
const {isValid, isValidRequestBody} = require('../validation/validator');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


const addProduct = async (req,res) => {
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

        let cartExist = await cartModel.findOne({userId:userId})
        // console.log(cartExist)

        if(!isValidRequestBody(req.body)){
            return res.status(400).send({
                status :false, message: "Must add data"
            })
        }
        let {items} = req.body
        // console.log(req.body)
        // console.log(items)
        items = JSON.parse(items)

        if(items.length == 0){
            return res.status(400).send({
                status :false,
                message: "add product data"
            })
        }

        let totalItems = 0, totalPrice = 0
        for(let key in items){
            if(!isValid(items[key].productId)){
                return res.status(400).send({
                    status :false,
                    message: "Not valid data"
                })
            }

            if(!ObjectId.isValid(items[key].productId)){
                return res.status(400).send({
                    status :false,
                    message: "Not valid Id"
                })
            }

            let productExist = await productModel.findById(items[key].productId)
            if(!productExist){
                return res.status(404).send({
                    status: false,
                    message: "product not Found"
                })
            }

            if(items[key].quantity < 1){
                return res.status(400).send({
                    status: false,
                    message: "provide quantity"
                })
            }

            totalItems += items[key].quantity
            totalPrice += productExist.price * items[key].quantity
        }

        // console.log(cartExist.items, items)
        if(cartExist){
            // cartExist.items.concat(items)
            let len = cartExist.items.length
            let arr = []
            // let map = new Map()
            for(let i=0;i<len;i++){
                arr.push(cartExist.items[i])
            }
            let productFound =0 
            for(let i=0; i<items.length; i++){
                for(let j=0; j<arr.length; j++){
                    if(arr[j].productId == items[i].productId){
                        arr[j].quantity += items[i].quantity
                        productFound=1
                    }
                }
                if(productFound==0)
                    arr.push(items[i])

                productFound = 0
            }

            cartExist.items = arr
            cartExist.totalItems = arr.length
            cartExist.totalPrice += totalPrice

            let data = await cartExist.save()

            return res.status(201).send({
                status: true,
                message : "Product added",
                data: data
            })
        }else{
            req.body.totalItems = totalItems
            req.body.totalPrice = totalPrice
            req.body.userId = userId
            req.body.items = items

            let data = await cartModel.create(req.body) 
            
            res.status(201).send({
                status: true,
                message : "Product added",
                data : data
            })
        }
        // console.log(totalItems,totalPrice)

    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const updateCart = async (req,res) => {
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

        let cartExist = await cartModel.findOne({userId:userId})

        if(!isValidRequestBody(req.body)){
            return res.status(400).send({
                status :false, message: "Must add data"
            })
        }

        let {removeProduct, productId} = req.body
        if(!isValid(productId) || !ObjectId.isValid(productId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid productId"
            })
        }
        
        
        let findProduct = await productModel.findById(productId)
        if(!findProduct){
            return res.status(404).send({
                status: false,
                message: "Product is not available"
            })
        }
        
        if(!isValid(removeProduct)){
            return res.status(400).send({
                status: false,
                message: "Enter valid removeProduct"
            })
        }

        let findInCart = await cartModel.findOne({userId: userId})
        for(let i=0; i<findInCart.items.length; i++){
            let num = 0
            if(findInCart.items[i].productId == productId){
                if(removeProduct == 0){
                    num = findInCart.items[i].quantity
                    findInCart.items[i].quantity = 0
                    findInCart.totalItems -= num
                    findInCart.totalPrice -= num * findProduct.price
                }else if(removeProduct == 1){
                    findInCart.items[i].quantity -= 1
                    findInCart.totalItems -= 1
                    findInCart.totalPrice -= findProduct.price
                }
            }
        }
        let data = await findInCart.save()
        res.status(200).send({
            status: true,
            message: "Updated",
            data: data
        })
        console.log(findInCart)

    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const getCart = async (req,res) => {
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

        let cartExist = await cartModel.findOne({userId:userId})
        // console.log(cartExist)

        res.status(200).send({
            status: true,
            message : "Successful",
            data: cartExist
        })
    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

const deleteCart = async (req,res) => {
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

        let cartExist = await cartModel.findOne({userId:userId})
        // console.log(cartExist)

        cartExist.items = []
        cartExist.totalItems = 0
        cartExist.totalPrice = 0

        let data = await cartExist.save()

        res.status(200).send({
            status: true,
            message : "Cart empty",
            data: data
        })

    }catch(error){
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

module.exports = {
    addProduct,
    updateCart,
    getCart,
    deleteCart
}

