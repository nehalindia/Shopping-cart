const productModel= require("../models/productModel")
const {isValid,isValidRequestBody} = require('../validation/validator');
const {uploadFile} = require("../aws/awss3")
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


const postProduct= async (req, res) => {
    try {
        if(!isValidRequestBody(req.body)){
            return res.status(400).send({status :false, message: "Must add data"})
        }
        let data = req.body
        // data = JSON.parse(data)
        let {title, description, price, currencyId, currencyFormate, 
            style, availableSizes, installments, isFreeShipping} = data
        
        // console.log(req.body)
        // currencyFormate = JSON.parse(currencyFormate)
        if(!isValid(title) || !isValid(description) || !isValid(currencyId)){
            return res.status(400).send({
                status: false,
                message: "provide valid detail"
            })
        }
        // if(!currencyFormate > 0){
        //     return res.status(400).send({
        //         status: false,
        //         message: "Currency format"
        //     })
        // }

        price  = JSON.parse(price)
        if(!price || typeof price !== "number"){
            return res.status(400).send({
                status: false,
                message: "provide price"
            })
        }
        req.body.price = price

        if(style){
            if(typeof style !== "string"){
                return res.status(400).send({
                    status: false,
                    message: "provide valid style"
                })
            }
        }

        installments = JSON.parse(installments)
        if(installments){
            if(typeof installments !== "number"){
                return res.status(400).send({
                    status: false,
                    message: "provide valid installments"
                })
            }
        }
        req.body.installments = installments
        
        availableSizes = JSON.parse(availableSizes)
        console.log(availableSizes)
        if(!availableSizes || typeof availableSizes !== "object"){
            return res.status(400).send({
                status: false,
                message: "provide at least one availableSizes"
            })
        }
        req.body.availableSizes = availableSizes

        let productSize= ["S","XS","M","X","L","XXL","XL"]
        for(let i=0; i<availableSizes.length; i++){
            if(!productSize.includes(availableSizes[i])){
                return res.status(400).send({
                    status: false,
                    message: "provide valid size"
                })
            }
        }

        // aws S3

        let productImage = req.files
        if(productImage && productImage.length > 0){
            let awss3link = await uploadFile(productImage[0])
            req.body.productImage= awss3link
        }else{
            return res.status(400).send({
                status: false,
                message: "please provide valid profile image"
            }) 
        }

        //checking unique or not

        let titleExist= await productModel.findOne({title: title})
        if(titleExist){
            return res.status(400).send({
                status: false,
                message: "title already exit"
            }) 
        }

        if(isFreeShipping){
            isFreeShipping = JSON.parse(isFreeShipping)
            req.body.isFreeShipping = isFreeShipping
        }
        console.log(req.body)
        const postProduct= await productModel.create(req.body)

        res.status(201).send({
            status: true,
            message: "product is successfully added",
            data: postProduct
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

// ********************************************************************************** //

const getProduct= async (req, res) => {
    try {
        let filters = {}
        filters.isDeleted = false
        let {size, name, priceGreaterThan, priceLessThan, priceSort} = req.query

        if(size){
            filters["availableSizes"] = { $in : size.split(",") };
        }
        if(name){
            filters.title = { $regex : name}
        }
        if(priceGreaterThan){
            filters.price = { $gt : priceGreaterThan}
        }
        if(priceLessThan){
            filters.price = { $lt : priceLessThan}
        }
        let sortp = {}
        if(priceSort){
            sortp.price = priceSort
        }

        let product = await productModel.find(filters).sort(sortp)
        res.status(200).send({
            status : true,
            message : "Success",
            data : product
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

// ********************************************************************************** //

const getProductById= async (req, res) => {
    try {
        let {productId} = req.params

        if(!isValid(productId) || !ObjectId.isValid(productId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid productId"
            })
        }

        let product  = await productModel.findOne({_id:productId, isDeleted: false})
        if(!product){
            return res.status(404).send({
                status: false,
                message: "Product not Found"
            })
        }

        res.status(200).send({
            status: true,
            message: "Success",
            data: product
        })
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

// ********************************************************************************** //

const updateProduct= async (req, res) => {
    try {
        let {productId} = req.params

        if(!isValid(productId) || !ObjectId.isValid(productId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid productId"
            })
        }

        let product  = await productModel.findOne({_id:productId, isDeleted: false})
        if(!product){
            return res.status(404).send({
                status: false,
                message: "Product not Found"
            })
        }

        if(!isValidRequestBody(req.body)){
            return res.status(400).send({status :false, message: "Must add data"})
        }
    
        let {title, description, price, currencyId, currencyFormate, 
            style, availableSizes, installments, isFreeShipping} = req.body
        
        if(title){
            if(!isValid(title)){
                return res.status(400).send({
                    status: false,
                    message: "provide valid title"
                })
            }

            let titleExist= await productModel.findOne({title: title})
            if(titleExist){
                return res.status(400).send({
                    status: false,
                    message: "title already exit"
                }) 
            }
            product.title = title
        }
        if(description){
            if(!isValid(description)){
                return res.status(400).send({
                    status: false,
                    message: "provide valid description"
                })
            }
            product.description = description
        }
        if(currencyId){
            if(!isValid(currencyId)){
                return res.status(400).send({
                    status: false,
                    message: "provide valid currencyId"
                })
            }
            product.currencyId = currencyId
        }

        if(currencyFormate){
            product.currencyFormat = currencyFormate
        }
        // if(!currencyFormate > 0){
        //     return res.status(400).send({
        //         status: false,
        //         message: "Currency format"
        //     })
        // }
        if(price){
            price  = JSON.parse(price)
            if(!price || typeof price !== "number"){
                return res.status(400).send({
                    status: false,
                    message: "provide price"
                })
            }
            product.price = price
        }

        if(style){
            if(typeof style !== "string"){
                return res.status(400).send({
                    status: false,
                    message: "provide valid style"
                })
            }
            product.style = style
        }

        
        if(installments){
            installments = JSON.parse(installments)
            if(typeof installments !== "number"){
                return res.status(400).send({
                    status: false,
                    message: "provide valid installments"
                })
            }
            product.installments = installments
        }
        
        if(availableSizes){
            availableSizes = JSON.parse(availableSizes)
            if(typeof availableSizes !== "object"){
                return res.status(400).send({
                    status: false,
                    message: "provide at least one availableSizes"
                })
            }
            let productSize= ["S","XS","M","X","L","XXL","XL"]
            for(let i=0; i<availableSizes.length; i++){
                if(!productSize.includes(availableSizes[i])){
                    return res.status(400).send({
                        status: false,
                        message: "provide valid size"
                    })
                }
            }
            product.availableSizes = availableSizes
        }

        // aws S3

        if(req.files.length > 0){
            let productImage = req.files
            if(productImage && productImage.length > 0){
                let awss3link = await uploadFile(productImage[0])
                product.productImage= awss3link
            }else{
                return res.status(400).send({
                    status: false,
                    message: "please provide valid profile image"
                }) 
            }
        }

        if(isFreeShipping){
            isFreeShipping = JSON.parse(isFreeShipping)
            product.isFreeShipping = isFreeShipping
        }
        
        let data  = await product.save()

        res.status(200).send({
            status: true,
            message: "product Updated",
            data : data
        })
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}

// ********************************************************************************** //

const deleteProduct= async (req, res) => {
    try {
        let {productId} = req.params

        if(!isValid(productId) || !ObjectId.isValid(productId)){
            return res.status(400).send({
                status: false,
                message: "Enter valid productId"
            })
        }

        let product  = await productModel.findOne({_id:productId, isDeleted: false})
        if(!product){
            return res.status(404).send({
                status: false,
                message: "Product not Found"
            })
        }
        
        product.isDeleted = true
        product.deletedAt = Date.now()

        await product.save()

        res.status(200).send({
            status: true,
            message: "product Deleted"
        })
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


module.exports = {
    postProduct,
    getProduct,
    getProductById,
    updateProduct,
    deleteProduct
}