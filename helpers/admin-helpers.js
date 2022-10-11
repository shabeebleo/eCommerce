var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const { doSignup } = require('./user-helpers');
const objectId = require('mongodb').ObjectId
const fs = require('fs');
const { resolve } = require('path');
module.exports = {

    // doLogin: (adminData) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let response = {}
    //             let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.name })
    //             if (admin) {
    //                 if (admin.password === adminData.password) {
    //                     response.admin = admin
    //                     response.status = true
    //                     resolve(response)
    //                 }
    //                 else {
    //                     resolve({ status: false })
    //                 }
    //             } else {
    //                 resolve({ status: false })
    //             }
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // },

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let allUsers = await db.get().collection(collections.USER_COLLECTION).find({}).toArray()
                resolve(allUsers)
            } catch (error) {
                reject(error)
            }
        })
    },

    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: false } })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },

    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { Active: true } })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },

    insertProducts: (productDetails) => {
        return new Promise((resolve, reject) => {
            try {
                productDetails.Price = parseInt(productDetails.Price)
                productDetails.Quantity = parseInt(productDetails.Quantity)
                db.get().collection(collections.PRODUCT_COLLECTION).insertOne(productDetails)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({}).toArray()
                resolve(allProducts)

            } catch (error) {
                reject(error)
            }
        })
    },
    deleteProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let images = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }, { images: 1 })
                images = images.images
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
                resolve()
            } catch (error) {
                reject(error)
            }

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
            }).catch((error) => {
                reject(error)
            })
        })
    },


    getproductDetails: (productId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(productId) }).then((data) => {
                resolve(data)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    insertCategories: (CategoryDetails) => {
        return new Promise(async (resolve, reject) => {
            try {
                let catExist = await db.get().collection(collections.CATEGORY_COLLECTION).findOne({ category: { $regex: CategoryDetails.category, $options: "i" } })
                console.log(catExist, "catexist");
                if (catExist) {
                    resolve()
                }
                else {
                    db.get().collection(collections.CATEGORY_COLLECTION).insertOne(CategoryDetails)
                    resolve()
                }
            } catch (error) {
                reject(error)
            }

        })
    },

    getAllCategories: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let allCategories = await db.get().collection(collections.CATEGORY_COLLECTION).find({}).toArray()
                resolve(allCategories)
            } catch (error) {
                reject(error)
            }
        })
    },




    getUserOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).find({}).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },

    getUserPlacedOrders: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ status: { $in: ["placed", "shipped","pending", "packed"] } }).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },

    getUserOrdersdetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
                resolve(orders[0].totalAmount)
            } catch (error) {
                reject(error)
            }
        })
    },

    getOrderedProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
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
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },

    getPlacedOrderedProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
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
            } catch (error) {
                reject(error)
            }
        })

    },

    changeOrderStatus: (orderId, statusUpdate) => {
        return new Promise((resolve, reject) => {
            try {
                if (statusUpdate == 'delivered') {
                    db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                        {
                            $set: { status: statusUpdate, deliveredOrder: true }
                        })

                    resolve({ updated: true })
                } else {

                    db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                        {
                            $set: { status: statusUpdate, placePackSHipOrder: true }
                        })

                    resolve({ updated: true })

                }
            } catch (error) {
                reject(error)
            }
        })
    },


    postCoupons: (couponDetails) => {
        return new Promise((resolve, reject) => {
            try {
                couponDetails.reduction = parseInt(couponDetails.reduction)
                db.get().collection(collections.COUPON_COLLECTION).insertOne(couponDetails)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllcoupons: () => {
        return new Promise(async (resolve, reject) => {
            try {
               let allCoupons = await db.get().collection(collections.COUPON_COLLECTION).find({}).toArray()
                resolve(allCoupons)
            } catch (error) {
                reject(error)
            }
        })
    },

    delcoupon: (coupId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.COUPON_COLLECTION).deleteOne({ _id: objectId(coupId) })
                resolve()
            } catch (error) {
                reject(error)
            }

        })

    },

    // getTotalRevenue: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let today = new Date()
    //         let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))
    //         console.log(before, today, "before");
    //         let revenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
    //             {
    //                 $match: {
    //                     status: 'delivered',
    //                     date: {
    //                         $gte: before,
    //                         $lte: today
    //                     }

    //                 }
    //             },
    //             {
    //                 $project: {
    //                     Paymentmethod: 1, GrandTotal: 1, date: 1
    //                 }
    //             },
    //             {
    //                 $group: {
    //                     _id: { date: { $dateToString: { format: "%m-%Y", date: "$date" } }, Paymentmethod: '$Paymentmethod' },

    //                     Amount: { $sum: '$GrandTotal' }
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     _id: 0,
    //                     date: '$_id.date',
    //                     Paymentmethod: '$_id.Paymentmethod',
    //                     Amount: '$Amount'
    //                 }
    //             }


    //         ]).sort({ date: 1 }).toArray()
    //         console.log(revenue,"revenuerevenue");
    //         let obj = {
    //             date: [], cod: [0, 0, 0, 0, 0, 0, 0, 0], online: [0, 0, 0, 0, 0, 0, 0, 0]
    //         }
    //         let month = ['Jan', 'Feb', 'March', 'April', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    //         let a = today.getMonth() - 6
    //         for (let i = 0; i < 8; i++) {
    //             for (let k = 0; k < revenue.length; k++) {
    //                 if (Number(revenue[k].date.slice(0, 2)) == Number(a + i)) {
    //                     if (revenue[k].Paymentmethod == 'COD')
    //                         obj.cod[i] = revenue[k].Amount
    //                 } else {
    //                     obj.online[i] = revenue[k].Amount
    //                 }
    //             }
    //             obj.date[i] = month[a + i - 1]
    //         }
    //         console.log(obj,"qweeeeeeeeee");
    //         resolve(obj)
    //     })
    // },

    getTotalRevenues: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))
                console.log(before, today, "before");
                let revenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'delivered',
                            date: {
                                $gte: before,
                                $lte: today
                            }

                        }
                    },
                    {
                        $project: {
                            Paymentmethod: 1, GrandTotal: 1, date: 1
                        }
                    },
                    {
                        $group: {
                            _id: { date: { $dateToString: { format: "%m-%Y", date: "$date" } }, Paymentmethod: '$Paymentmethod' },

                            Amount: { $sum: '$GrandTotal' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            date: '$_id.date',
                            Paymentmethod: '$_id.Paymentmethod',
                            Amount: '$Amount'
                        }
                    }


                ]).sort({ date: 1 }).toArray()
                console.log(revenue, "revenuerevenue");
                let obj = {
                    date: [], cod: [0, 0, 0, 0, 0, 0, 0, 0], online: [0, 0, 0, 0, 0, 0, 0, 0]
                }
                let month = ['Jan', 'Feb', 'March', 'April', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                let a = today.getMonth() - 6
                for (let i = 0; i < 8; i++) {

                    obj.date[i] = month[a + i - 1]
                }

                obj.cod[6] = revenue[1].Amount
                obj.cod[7] = revenue[4].Amount
                obj.online[5] = revenue[0].Amount
                obj.online[6] = revenue[2].Amount
                obj.online[7] = revenue[3].Amount
                console.log(obj, "qweeeeeeeeee");
                resolve(obj)
            } catch (error) {
                reject(error)
            }
        })
    },



    getTotalRevenuePie: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))
                console.log(today, before, "beforebefore");
                let revenue = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: "delivered",
                            date: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $project: {
                            Paymentmethod: 1, GrandTotal: 1, date: 1
                        }
                    },
                    {
                        $group: {
                            _id: { Paymentmethod: "$Paymentmethod" },
                            Amount: { $sum: "$GrandTotal" }
                        }
                    },
                    {
                        $sort: {
                            "_id.Paymentmethod": 1
                        }
                    }
                ]).toArray()
                console.log(revenue, "getTotalRevenuePie");
                let obj = {
                    cod: [1, 0], online: [1, 0]
                }
                console.log(revenue[1].Amount, "revenue[1].Amount");

                obj.cod[1] = revenue[0].Amount
                obj.online[1] = revenue[1].Amount
                console.log(obj, "obj");
                resolve(obj)
            } catch (error) {
                reject(error)
            }
        })
    },

    getOverAllSale: () => {
        return new Promise(async (resolve, reject) => {
            try {
             
                let today = new Date()
                let before = new Date(new Date().getTime() - (100 * 24 * 60 * 60 * 1000))
                let getOverAllSale = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'delivered',
                            date: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    },
                    {
                        $project: {
                            GrandTotal: 1
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            sum: { $sum: "$GrandTotal" }
                        }
                    }
                ]).toArray()
                resolve(getOverAllSale[0].sum)

            } catch (error) {
                reject(error)
            }
        })
    },

    getAllSales: () => {
        return new Promise(async (resolve, reject) => {
            try {
             
                let sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: "delivered"
                        }
                    },
                    {
                        $unwind:
                            '$products'
                    },
                    {
                        $group: {

                            _id: null,
                            sum: {
                                $sum: "$products.quantity"

                            }

                        }
                    }

                ]).toArray()
                console.log(sales[0].sum);
                resolve(sales[0].sum)
            } catch (error) {
                reject(error)
            }

        })
    },
    userCount: () => {
        return new Promise(async (resolve, reject) => {
            try {

                let userCount = await db.get().collection(collections.USER_COLLECTION).find({}).count()
                resolve(userCount)
            } catch (error) {
                reject(error)
            }
        })
    },
    
    orderCount: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let userCount = await db.get().collection(collections.ORDER_COLLECTION).find({}).count()
                resolve(userCount)
            } catch (error) {
                reject(error)
            }
        })
    },

    getMonthlySalesLineChart: (getOverAllSale) => {
        return new Promise(async (resolve, reject) => {
            try {
                let today = new Date()
                let before = new Date(new Date().getTime() - (250 * 24 * 60 * 60 * 1000))
                console.log("getMonthlySalesLineChartHelpers");
                let monthlySales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            status: 'delivered',
                            date: {
                                $gte: before,
                                $lte: today
                            }
                        }
                    }, {
                        $project: {
                            date: 1, GrandTotal: 1
                        }
                    }, {
                        $group: {
                            _id: { date: { $dateToString: { format: "%m-%Y", date: '$date' } } },
                            monthlySales: { $sum: "$GrandTotal" }
                        }
                    },
                    // {
                    //     $sort:{
                    //         monthlySales:1
                    //     }
                    // }
                ]).toArray()
                console.log(monthlySales, "monthlySalesmonthlySales");
                let obj = [[0, 1], [1, 2], [2, 3]]

                obj[0][1] = Math.floor(monthlySales[0].monthlySales * 10 / getOverAllSale)
                obj[1][1] = Math.ceil(monthlySales[1].monthlySales * 10 / getOverAllSale)
                obj[2][1] = Math.ceil(monthlySales[2].monthlySales * 10 / getOverAllSale)

                resolve(obj)
            } catch (error) {
                reject(error)
            }
        })
    },


    categoryRevenue: (categName) => {
        return new Promise(async (resolve, reject) => {
            try {
                let categoryRevenue = await db
                    .get()
                    .collection(collections.ORDER_COLLECTION)
                    .aggregate([
                        {
                            $match: { status: "delivered" },
                        },
                        {
                            $unwind: "$products",
                        },
                        {
                            $lookup: {
                                from: collections.PRODUCT_COLLECTION,
                                localField: "products.item",
                                foreignField: "_id",
                                as: "product",
                            }
                        }
                        ,
                        {
                            $unwind: "$product",
                        },
                        {
                            $project: {
                                category: "$product.Categories",

                                prodPrice: "$product.Price",
                                total: {
                                    $multiply: ["$products.quantity", "$product.Price"],
                                },
                            },
                        },
                        {
                            $match: {
                                category: categName,
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                total: 1
                            },
                        },
                    ])
                    .toArray();
                console.log(categoryRevenue, "categoryRevenuecategoryRevenue");
                let totalCategRevenue = 0;
                for (i = 0; i <= categoryRevenue.length - 1; i++) {
                    totalCategRevenue += categoryRevenue[i].total;
                }
                resolve(totalCategRevenue);
            } catch (error) {
                reject(error)
            }

        });
    }
}


