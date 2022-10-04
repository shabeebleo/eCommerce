var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const { doSignup } = require('./user-helpers');
const objectId = require('mongodb').ObjectId
const fs = require('fs');
const { resolve } = require('path');
module.exports = {

    doLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.name })

            if (admin) {
                if (admin.password === adminData.password) {
                    resolve({ status: true })

                }
                else {
                    resolve({ status: false })

                }
            } else {
                resolve({ status: false })
            }
        })
    },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray()
            resolve(allUsers)

        })
    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: false } })
            resolve()
        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: true } })
            resolve()
        })
    },

    insertProducts: (productDetails) => {
        return new Promise((resolve, reject) => {
            productDetails.Price = parseInt(productDetails.Price)
            productDetails.Quantity = parseInt(productDetails.Quantity)
            db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails)
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
            resolve(allProducts)

        })
    },
    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let images = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }, { images: 1 })

            images = images.images
            console.log(images.length);
            if (images.length > 0) {
                let imageNames = images.map((x) => {
                    x = `public/product-images/${x}`
                    return x
                })
                imageNames.forEach((element) => {
                    fs.existsSync(element) && fs.unlinkSync(element)
                });
            }
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: objectId(productId) })

        })
    },
    editedProduct: (proId, proDetails) => {
        return new Promise((resolve, reject) => {
            let oldImage = null
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) }).then((product) => {
                if (proDetails.images.length == 0) {
                    proDetails.images = product.images
                } else {
                    oldImage = product.Images
                }

                db.get().collection(collections.PRODUCT_COLLECTION).updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Product: proDetails.Product,
                        Brand: proDetails.Brand,
                        Categories: proDetails.Categories,
                        Quantity: proDetails.Quantity,
                        Price: proDetails.Price,
                        Discription: proDetails.Discription,
                        images: proDetails.images

                    }
                }).then(() => {
                    resolve(oldImage)
                })
            })
        })



    },


    getproductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((data) => {

                resolve(data)
            })
        })
    },




    insertCategories: (CategoryDetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CATEGORY_COLLECTION).insertOne(CategoryDetails)
        })
    },
    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            let allCategories = await db.get().collection(collections.CATEGORY_COLLECTION).find({}).toArray()

            resolve(allCategories)
        })
    },
    delCategory: (catId) => {
        db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) })

    },


    getUserOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({}).toArray()
            resolve(orders)
        })
    },

    getUserPlacedOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ status: { $in: ["placed", "shipped", "packed"] } }).toArray()

            resolve(orders)
        })
    },
    getUserOrdersdetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
            resolve(orders[0].totalAmount)
        })
    },

    getOrderedProducts: (orderId) => {

        console.log(orderId, "uuuuuu");
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                { $match: { _id: objectId(orderId) } },
                { $unwind: '$products' },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: '$item',
                        quantity: '$quantity',
                        product: '$product',
                        proTotal: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                    }

                },



            ]).toArray()
            console.log(products, "llkklklkkkkkk");
            resolve(products)
        })

    },

    getPlacedOrderedProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                { $match: { _id: objectId(orderId) } },
                { $match: { status: "status" } },
                { $unwind: '$products' },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        item: '$item',
                        quantity: '$quantity',
                        product: '$product',
                        proTotal: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                    }

                },

            ]).toArray()

            resolve(products)
        })

    },

    changeOrderStatus: (orderId, statusUpdate) => {
        return new Promise((resolve, reject) => {
            if (statusUpdate == 'delivered') {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    {
                        $set: { status: statusUpdate, deliveredOrder: true }
                    })

                resolve({ updated: true })
            } else {

                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    {
                        $set: { status: statusUpdate, placePackSHipOrder:true }
                    })

                resolve({ updated: true })

            }

        })

    },
    postCoupons:(couponDetails)=>{
        return new Promise((resolve, reject) => {
            couponDetails.reduction=parseInt(couponDetails.reduction)               
            db.get().collection(collections.COUPON_COLLECTION).insertOne(couponDetails)
        })
    },
     getAllcoupons: () => {
        return new Promise(async (resolve, reject) => {
            let allCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({}).toArray()

            resolve(allCoupons)
        })
    },
    delcoupon: (coupId) => {
        db.get().collection(collections.COUPON_COLLECTION).deleteOne({ _id: objectId(coupId) })

    }










}


