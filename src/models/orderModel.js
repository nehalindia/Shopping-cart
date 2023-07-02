const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema(
    {
        userId: {
            ObjectId, 
            ref : 'user',
            required : true
        },
        items: [{
          productId: {ObjectId,
            ref : 'product',
            required : true
          },
          quantity: {
            Number,
            required: true,
            min : 1
          }
        }],
        totalPrice: {
            Number,
            required : true,
            comment: "Holds total price of all the items in the cart"
        },
        totalItems: {
            Number,
            required : true,
            comment: "Holds total number of items in the cart"
        },
        totalQuantity: {
            Number,
            required : true,
            comment: "Holds total number of quantity in the cart"
        },
        cancellable: {
            Boolean,
            default: true
        },
        status: {
            String,
            default: 'pending',
            enum : ['pending','completed', 'canceled']
        },
        deletedAt: {
            Date,
            default : null
        }, 
        isDeleted: {
            Boolean,
            default: false
        }
    },{ timestamps : true }
)

module.exports = mongoose.model('order', orderSchema)