const userModel = require('../models/userModel')
const validator = require('validator');
const {isValid,isValidRequestBody} = require('../validation/validator');
require('dotenv').config
const {uploadFile}= require("../aws/awss3")
const bcrypt= require("bcrypt")
const jwt= require("jsonwebtoken")
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


const createUser = async function(req,res){
    // let files = req.files
    // console.log(files)
    // let data = req.body
    // let address = JSON.parse(data.address)
    // console.log(data)
    // console.log(address.shipping.street)
    // console.log(req.headers.authorization) 
    try{
        if(!isValidRequestBody(req.body)){
            return res.status(400).send({status :false, message: "Must add data"})
        }
        let {fname, lname, email, phone, password, address}= req.body
        address = JSON.parse(address)
        if(!isValid(fname) || !isValid(lname) || !isValid(email) || !isValid(phone) || !isValid(password)){
            return res.status(400).send({
                status: false,
                message: "enter valid detail"
            })
        }
        if(!isValid(address.shipping.street) || !isValid(address.shipping.city) || !isValid(address.billing.street) || !isValid(address.billing.city)){
            return res.status(400).send({
                status: false,
                message: "enter valid address"
            })
        }
        if(!isValid(address.shipping.pincode) && typeof address.shipping.pincode !== 'number' || !isValid(address.billing.pincode) && typeof address.billing.pincode !== 'number'){
            return res.status(400).send({
                status: false,
                message: "enter valid shipping pincode"
            }) 
        }
        req.body.address = address

        email= email.trim()
        if(!validator.isEmail(email)){
            return res.status(400).send({
                status : false,
                message : "Enter valid email id"
            })
        }
        password = password.trim()
        if(password.length < 8 || password.length > 15){
            return res.status(400).send({
                status: false,
                message: "Password length must between 8 to 15"
            })
        }
        phone = phone.trim()
        if(!validator.isMobilePhone(phone)){
            return res.status(400).send({
                status : false,
                message : "Enter valid Mobile Number"
            })
        }

        let profileImage = req.files
        if(profileImage && profileImage.length > 0){
            let awss3link= await uploadFile(profileImage[0])
            req.body.profileImage= awss3link
        }else{
            return res.status(400).send({
                status: false,
                message: "please provide valid profile image"
            }) 
        }

        let emailExist= await userModel.findOne({email: email})
        if(emailExist){
            return res.status(400).send({
                status: false,
                message: "email already exist"
            }) 
        }
        let phoneExist = await userModel.findOne({phone: phone})
        if(phoneExist){
            return res.status(400).send({
                status: false,
                message: "phone already exist"
            }) 
        }


        const salt = await bcrypt.genSalt(5);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
        // console.log(req.body)
        const user = await userModel.create(req.body)
        
        res.status(201).send({
            status: true,
            message: "user created successfully",
            data: user
        })


    }catch(error){
        res.status(500).send({
            status : false, 
            message : error.message
        })
    }
}

const userLogin= async (req, res) => {
    try {
        if(!isValidRequestBody(req.body)){
            return res.status(400).send({status :false, message: "Must add data"})
        }
        let {email, password}= req.body
        email = email.trim()
        if(!isValid(email) || !isValid(password)){
            return res.status(400).send({
                status: false,
                message: "please provide valid email and password"
            })
        }
        if(!validator.isEmail(email)){
            return res.status(400).send({
                status : false,
                message : "Enter valid email id"
            })
        }

        const user = await userModel.findOne({email})     
        if(!user){
            return res.status(401).send({
              status : false, 
              message : "invalid email" 
            })
        }
        
        let match= bcrypt.compareSync(password, user.password)
        if(!match){
            return res.status(401).send({
                status : false, 
                message : "invalid password" 
            })
        }

        const token = jwt.sign({userId : user._id}, process.env.JWT_SECRET_KEY,{expiresIn : "25d"},{iat : Date.now()})
        res.status(200).send({
          status : true,
          message: "user login successful", 
          data : {
            userId: user._id,
            token: token
            } 
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


const getUser = async (req, res) => {
    try {
        let {userId} = req.params

        if(!isValid(userId)){ 
            return res.status(404).send({
                status: false,
                message: 'enter userId'
            })
        }

        if(!ObjectId.isValid(userId)){
            return res.status(400).send({
                status: false,
                message: 'enter valid userId'
            })
        }
        //authorization
        if(req.userId != userId) {
            return res.status(403).send({
                status:false,
                message: "Unauthorized"
            })
        }

        let userIdExist = await userModel.findOne({_id: userId}) 
        if(!userIdExist){
            return res.status(404).send({
                status: false,
                message: 'userId not exist'
            })
        }

        res.status(200).send({
            status: true,
            message: "user profile details",
            data: userIdExist
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


const updateUser= async (req, res) => {
    try {
        let {userId}= req.params

        if(!isValid(userId)) return res.status(404)
        .send({
            status: false,
            message: 'please provide userId'
        })

        if(!ObjectId.isValid(userId)){
            return res.status(400).send({
                status: false,
                message: 'enter valid userId'
            })
        }
        //authorization
        if(req.userId != userId) {
            return res.status(403).send({
                status:false, 
                message: "Unauthorized"
            })
        }

        let userIdExist = await userModel.findOne({_id: userId}) 
        if(!userIdExist) return res.status(404).send({
            status: false,
            message: 'userId not exit'
        })
        
        
        // if(req["x-api-key"].userId != userIdExist._id){
        //     return res.status(403).send({
        //         status: false,
        //         message: "unauthorized, userId not same"
        //     })
        // }

        //detail for updation
        if(!isValidRequestBody(req.body)){
            return res.status(400).send({status :false, message: "Must add data"})
        }
        let {fname, lname, email, phone, password, address}= req.body

        if(fname){
            if(!isValid(fname)){
                return res.status(400).send({
                    status: false,
                    message: "please provide fname"
                })
            }
            userIdExist.fname = fname
        }
        
        if(lname){
            if(!isValid(lname)){
                return res.status(400).send({
                    status: false,
                    message: "please provide lname"
                })
            }
            userIdExist.lname= lname
        }

        if(password){
            if(!isValid(password)){
                return res.status(400).send({
                    status: false,
                    message: "please provide password"
                })
            }
            password= password.trim()
            if(password.length < 8 || password.length > 15){
            return res.status(400).send({
                status: false,
                message: "password length should be between 8 to 15"
            }) 
            }
            //password bcrypt
            const salt = await bcrypt.genSalt(5);
            const hashedPassword = await bcrypt.hash(password, salt);
            userIdExist.password = hashedPassword;
        }

        if(email){
            if(!isValid(email)){
                return res.status(400).send({
                    status: false,
                    message: "please provide email"
                })
            }
            email= email.trim()
            if(!validator.isEmail(email)){
                return res.status(400).send({
                    status: false,
                    message: "please provide valid email"
                }) 
            }

            //checking unique or not
            let emailExist= await userModel.findOne({email: email})
            if(emailExist){
                return res.status(400).send({
                    status: false,
                    message: "email already exit"
                }) 
            }
            userIdExist.email= email
        }

        if(phone){
            if(!isValid(phone)){
                return res.status(400).send({
                    status: false,
                    message: "please provide phone"
                })
            }
            phone= phone.trim()
            if(!validator.isMobilePhone(phone)){
                return res.status(400).send({
                    status: false,
                    message: "please provide valid phone number"
                }) 
            }
            let phoneExist= await userModel.findOne({phone: phone})
            if(phoneExist){
                return res.status(400).send({
                    status: false,
                    message: "phone already exit"
                }) 
            }
            userIdExist.phone= phone
        }

        if(address){
            address = JSON.parse(address)
            // console.log(address.shipping.street)
            if(address.shipping.street){
                if(!isValid(address.shipping.street)){
                    return res.status(400).send({
                        status: false,
                        message: "please provide address.shipping.street"
                    })
                }
                userIdExist.address.shipping.street= address.shipping.street
            }
    
            if(address.shipping.city){
                if(!isValid(address.shipping.city)){
                    return res.status(400).send({
                        status: false,
                        message: "please provide address.shipping.city"
                    })
                }
                userIdExist.address.shipping.city= address.shipping.city
            }
            
            if(address.billing.street){
                if(!isValid(address.billing.street)){
                    return res.status(400).send({
                        status: false,
                        message: "please provide address.billing.street"
                    })
                }
                userIdExist.address.billing.street= address.billing.street
            }
    
            if(address.billing.city){
                if(!isValid(address.billing.city)){
                    return res.status(400).send({
                        status: false,
                        message: "please provide address.billing.city"
                    })
                }
                userIdExist.address.billing.city= address.billing.city
            }
    
            if(address.shipping.pincode){
                if(!address.shipping.pincode && typeof address.shipping.pincode !== 'number'){
                    return res.status(400).send({
                        status: false,
                        message: "please provide valid shipping pincode"
                    })
                }
                userIdExist.address.shipping.pincode= address.shipping.pincode
            }
    
            if(address.billing.pincode){
                if(!address.billing.pincode && typeof address.billing.pincode !== 'number'){
                    return res.status(400).send({
                        status: false,
                        message: "please provide valid billing pincode"
                    })
                }
                userIdExist.address.billing.pincode= address.billing.pincode
            }
    
        }
        // aws S3
    
        let profileImage = req.files
        if(profileImage){
            if(profileImage && profileImage.length > 0){
                let awss3link = await uploadFile(profileImage[0])
                userIdExist.profileImage= awss3link
            }
        }
        

        const updateUser = await userIdExist.save()

        res.status(200).send({
            status: true,
            message: "updated successfully",
            data: updateUser
        }) 
        
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message
        })
    }
}


module.exports = {
    createUser,
    userLogin,
    getUser,
    updateUser
}
