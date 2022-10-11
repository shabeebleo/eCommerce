var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt');
const objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                userData.password = await bcrypt.hash(userData.password, 10)
                userData.Active = true
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                }).catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {

            try {
                let loginStatus = false
                let response = {}

                let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status && user.Active) {

                            response.user = user;
                            response.status = true;
                            resolve(response)
                        }
                        else {

                            resolve({ status: false })
                        }

                    }).catch((error) => {

                        reject(error)
                    })
                } else {

                    resolve({ status: false })

                }
            } catch (error) {
                reject(error)
            }
        })
    },

    // checkUserExist : (userData)=>{
    //     return new Promise(async(resolve, reject) => {
    //         try {
    //             let userExist = await db.get().collection(collections.USER_COLLECTION).findOne({email:userData.email})
    //             if(userExist){
    //               resolve({userExist:true})
    //             }else{
    //               resolve({userExist:false})
    //             }
    //         } catch (error) {
    //             reject(error)
    //         }
         
    //     })
    //   },


    
    getUserDetails: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userDetails = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                resolve(userDetails)
            } catch (error) {
                reject(error)
            }
        })
    },


    postEditProfile: (userId, editedUserDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({
                    _id: objectId(userId)
                }, {
                    $set: {
                        username: editedUserDetails.name
                    }
                }).then(() => {
                    resolve()
                }).catch((error) => {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }
        })
    },


    postChangePassword: (newPassword, userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedNewPassword = await bcrypt.hash(newPassword, 10)

                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { password: hashedNewPassword } })
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

    getProductsHome1: (limit) => {
        return new Promise(async (resolve, reject) => {
            try {
                let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                    {
                        $limit: limit
                    }
                ]).toArray()
                resolve(allProducts)
            } catch (error) {
                reject(error)
            }
        })
    },

    getProductsHome2: (skip) => {
        return new Promise(async (resolve, reject) => {
            try {
                let allProducts = await db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                    {
                        $skip: skip
                    }
                ]).toArray()
                resolve(allProducts)
            } catch (error) {
                reject(error)
            }
        })
    },

    searchProducts: (key) => {
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collections.PRODUCT_COLLECTION).find({
                    $or: [
                        {
                            Product: { $regex: key, $options: "i" }
                        },
                        {
                            Categories: { $regex: key, $options: "i" }
                        },
                        {
                            Brand: { $regex: key, $options: "i" }
                        }
                    ]
                }).toArray()
                resolve(products)
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllCat: () => {
        return new Promise(async (resolve, reject) => {
            try {
                const allCategory = await db.get().collection(collections.CATEGORY_COLLECTION).find({}, { _id: 0 }).toArray()
                resolve(allCategory)
            } catch (error) {
                reject(error)
            }
        })
    },

    getAllProductsCat: (category) => {
        return new Promise(async (resolve, reject) => {
            try {
                let allCatProducts = await db.get().collection(collections.PRODUCT_COLLECTION).find({ Categories: category }).toArray()
                resolve(allCatProducts)
            } catch (error) {
                reject(error)
            }
        })
    },
    proDetails: (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                productDetails = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
                resolve(productDetails)
            } catch (error) {
                reject(error)
            }
        })
    },



    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (userCart) {
                    let proExist = userCart.products.findIndex(product => product.item == proId)
                    console.log(proExist);
                    if (proExist != -1) {
                        await db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            { $inc: { 'products.$.quantity': 1 } }).then(() => {
                                resolve({ quantityLimit: true })
                            }).catch((error) => {
                                reject(error)
                            })
                    } else {
                        await db.get().collection(collections.CART_COLLECTION).updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }).then(() => {
                                resolve({ status: true })
                            }).catch((error) => {
                                reject(error)
                            })
                    }
                } else {
                    let cartObj = {
                        user: objectId(userId),
                        products: [proObj]
                    }
                    await db.get().collection(collections.CART_COLLECTION).insertOne(cartObj)
                    resolve()
                }
            } catch (error) {
                reject(error)
            }
        })
    },


    postaddAddress: (userId, address) => {
        create_random_id(15)
        function create_random_id(string_length) {
            var randomString = '';
            var numbers = '123456789'
            for (var i = 0; i < string_length; i++) {
                randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
            }
            address.addId = "add" + randomString
        }

        let addressObj = {
            addId: address.addId,
            name: address.name,
            phone: address.phone,
            building_Name: address.building_Name,
            street_name: address.street_name,
            city: address.city,
            district: address.district,
            state: address.state,
            pincode: address.pincode
        }

        return new Promise(async (resolve, reject) => {
            try {
                let userDetail = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                console.log(userDetail.address, "lll");
                if (userDetail.address) {

                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                        {
                            $push: { address: addressObj }
                        })
                } else {
                    let address = [addressObj]
                    db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) }, { $set: { address: address } })
                    resolve()
                }

            } catch (error) {
                reject(error)
            }

        })
    },

    getAllAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let userDetail = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: objectId(userId) })
                let allAddress = userDetail.address
                resolve(allAddress)
            } catch (error) {
                reject(error)
            }

        })



    },

    postDeleteAddress: (userId, addressId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                    { $pull: { address: { addId: addressId } } })
                    .then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject(error)
                    })
            } catch (error) {
                reject(error)
            }

        })
    },

    postCurrentAddress: (userId, addressId) => {
        return new Promise(async (resolve, response) => {
            try {
                let currentAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    { $match: { _id: objectId(userId) } },
                    { $unwind: '$address' },
                    { $match: { 'address.addId': addressId } }
                ]).toArray()
                resolve(currentAddress[0].address)
            } catch (error) {
                reject(error)
            }
        })
    },


    getDeliveryAddress: (userId, addressId) => {
        return new Promise(async (resolve, response) => {
            try {
                let currentAddress = await db.get().collection(collections.USER_COLLECTION).aggregate([
                    { $match: { _id: objectId(userId) } },
                    { $unwind: '$address' },
                    { $match: { 'address.addId': addressId } }

                ]).toArray()
                resolve(currentAddress[0].address)
            } catch (error) {
                reject(error)
            }
        })
    },

    posteditaddress: (editedAddress) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: objectId(editedAddress.userId), 'address.addId': editedAddress.addressId },
                    {
                        $set: {
                            "address.$.name": editedAddress.name,
                            "address.$.phone": editedAddress.phone,
                            "address.$.building_Name": editedAddress.building_Name,
                            "address.$.street_name": editedAddress.street_name,
                            "address.$.city": editedAddress.city,
                            "address.$.district": editedAddress.district,
                            "address.$.state": editedAddress.state,
                            "address.$.pincode": editedAddress.pincode
                        }
                    }).then((response) => {
                        resolve(response)
                    }).catch((error) => {
                        reject(error)
                    })

            } catch (error) {
                reject(error)
            }

        })

    },


    addToWishlist: (proId, userId) => {
        let proObj = {
            item: objectId(proId),

        }
        return new Promise(async (resolve, reject) => {
            try {
                let userWishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
                if (userWishlist) {
                    let proExist = userWishlist.products.findIndex(product => product.item == proId)
                    console.log(proExist);
                    if (proExist != -1) {
                        resolve({ status: "already exist" })
                    } else {
                        db.get().collection(collections.WISHLIST_COLLECTION).updateOne({ user: objectId(userId) },
                            {
                                $push: { products: proObj }
                            }).then((response) => {
                                resolve(response)
                            }).catch((error) => {
                                reject(error)
                            })
                    }
                } else {
                    let wishlistObj = {
                        user: objectId(userId),
                        products: [proObj]
                        // products: [objectId(proId)]
                    }
                    db.get().collection(collections.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response) => {
                        resolve()
                    }).catch((error) => {
                        reject(error)
                    })
                }
            } catch (error) {
                reject(error)
            }
        })
    },





    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products' //products array  in the cart// 
                    },
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


                    /////////////////////////to get product wise total/////////////////////
                    {
                        $project: {
                            item: '$item',
                            quantity: '$quantity',
                            product: '$product',
                            proTotal: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                        }

                    }

                ]).toArray()
                console.log(cartItems, "cartitems");
                resolve(cartItems)

            } catch (error) {
                reject(error)
            }
        })
    },



    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                count = 0
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            } catch (error) {
                reject(error)
            }
        })
    },


    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                count = 0
                let wishlist = await db.get().collection(collections.WISHLIST_COLLECTION).findOne({ user: objectId(userId) })
                if (wishlist) {
                    count = wishlist.products.length
                }
                resolve(count)
            } catch (error) {
                reject(error)
            }

        })
    },

    getWislistProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let wislistProducts = await db.get().collection(collections.WISHLIST_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item'
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
                        $unwind: '$product'


                    }
                ]).toArray()
                resolve(wislistProducts)
            } catch (error) {
                reject(error)
            }
        })
    },

    delWishlistPro: (details) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.WISHLIST_COLLECTION)
                    .updateOne({ _id: objectId(details.wishlist) },
                        { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                            resolve(response)
                        }).catch((error) => {
                            reject(error)
                        })
            } catch (error) {
                reject(error)
            }
        })
    },


    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)

        details.quantity = parseInt(details.quantity)

        return new Promise(async (resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    console.log('hiii');
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart) },
                            { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                                resolve({ removeProduct: true })
                            }).catch((error) => {
                                reject(error)
                            })

                }
                else {
                    db.get().collection(collections.CART_COLLECTION)
                        .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }).then((response) => {

                                resolve({ status: true })
                            }).catch((error) => {
                                reject(error)
                            })
                }
            } catch (error) {
                reject(error)
            }
        })
    },






    delCartPro: (details) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        { $pull: { products: { item: objectId(details.product) } } }).then((response) => {

                            resolve(response)
                        }).catch((error) => {
                            reject(error)
                        })
            } catch (error) {
                reject(error)
            }
        })
    },

    postProTotal: async (userId, proId) => {
        console.log(proId, 'proId');
        return new Promise(async (resolve, reject) => {
            try {
                let proTotal = await db.get().collection(collections.CART_COLLECTION).aggregate([

                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products' //products array  in the cart// 
                    },
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

                        $unwind:
                            '$product'

                    }
                    ,
                    {
                        $match: { "product._id": objectId(proId) }
                    },

                    {
                        $project: {
                            _id: 0,
                            proTotall: { $multiply: ['$quantity', { $toInt: '$product.Price' }] }
                        }
                    }

                ]).toArray()
                console.log(proTotal[0], "proTotal user-help");
                resolve(proTotal[0])
            } catch (error) {
                reject(error)
            }
        })
    },



    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collections.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
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
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                        }
                    }
                ]).toArray()
                resolve(total[0])

            } catch (error) {
                reject(error)
            }
        })
    },

    getCartProductList: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collections.CART_COLLECTION).findOne({ user: objectId(userId) })
                console.log(cart);
                resolve(cart.products)
            } catch (error) {
                reject(error)
            }
        })

    },


    placeOrder: (order, products, couponName, total) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = order['Payment-method'] === 'COD' ? 'placed' : 'pending'
                let GrandTotal = parseInt(order.grandTotal)
                let discount = parseInt(order.Discount)

                console.log(GrandTotal, discount, "helper 711");
                let orderObj = {
                    deliveryDetails: {
                        Mobile: order.Phone,
                        Pincode: order.Pincode,
                        State: order.State,
                        District: order.District,
                        StreetName: order.Street_Name,
                        BuidlingName: order.Buidling_Name

                    },
                    userId: objectId(order.userId),
                    Paymentmethod: order['Payment-method'],
                    products: products,
                    totalAmount: total.total,
                    status: status,
                    date: new Date(),
                    placePackSHipOrder: true,
                    GrandTotal: GrandTotal,
                    Discount: discount
                }
                let users = [objectId(order.userId)]
                if (couponName) {
                    let coupon = await db.get().collection(collections.COUPON_COLLECTION).findOne({ coupon: couponName })
                    if (coupon.users) {
                        db.get().collection(collections.COUPON_COLLECTION).updateOne({ coupon: couponName }, { $push: { users: objectId(order.userId) } })
                    } else {
                        db.get().collection(collections.COUPON_COLLECTION).updateOne({ coupon: couponName }, { $set: { users } })
                    }
                }
                db.get().collection(collections.ORDER_COLLECTION).insertOne(orderObj).then((response) => {

                    db.get().collection(collections.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                    resolve(response.insertedId)
                }).catch((error) => {
                    reject(error)
                })
            } catch (error) {
                reject(error)
            }

        })
    },

    generateRazorpay: (orderId, grandTotal) => {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: grandTotal * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                    } else {
                        resolve(order)
                    }
                });

            } catch (error) {
                reject(error)
            }
        })
    },

    postVerifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmac = crypto.createHmac('sha256', 'dw0tKtVBkSHgQGo6YQTCo4Rb');
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },

    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.ORDER_COLLECTION)
                    .updateOne({ _id: objectId(orderId) },
                        {
                            $set: {
                                status: 'placed'
                            }
                        }).then(() => {
                            resolve()
                        }).catch((error) => {
                            reject(error)
                        })
            } catch (error) {
                reject(error)
            }
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
        })
    },
    getUserSpecificOrders: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collections.ORDER_COLLECTION).find({ _id: objectId(orderId) }).toArray()
                resolve(orders[0])
            } catch (error) {
                reject(error)
            }
        })
    },


    getOrderProducts: (orderId) => {
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

                    }
                ]).toArray()
                console.log(products, "llkklklkkkkkk");
                resolve(products)
            } catch (error) {
                reject(error)
            }

        })
    },

    returnStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    { $set: { status: 'return', deliveredOrder: false, placePackSHipOrder: false, shopAgain: true } })
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
                            $set: { status: statusUpdate }
                        })

                    resolve({ updated: true })

                }
            } catch (error) {
                reject(error)
            }
        })
    },



    cancelStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collections.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) },
                    { $set: { status: 'cancel', deliveredOrder: false, placePackSHipOrder: false, shopAgain: true } })
            } catch (error) {
                reject(error)
            }
        })
    },

    postapplyCoupon: (coupon, userId, subtotal) => {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collections.COUPON_COLLECTION).findOne({ coupon: coupon })
                if (result) {
                    var d = new Date()
                    let str = d.toJSON().slice(0, 10)
                    if (str > result.expiryDate) {
                        console.log("expire");
                        resolve({ expired: true })
                    } else {
                        let user = await db.get().collection(collections.COUPON_COLLECTION).findOne({ coupon: coupon, users: { $in: [objectId(userId)] } })
                        if (user) {
                            console.log("used");
                            resolve({ used: true })
                        } else {
                            let minCartValue = parseInt(result.minCartValue)
                            if (subtotal < minCartValue) {
                                result.orderLimit = true
                                resolve(result)
                            } else {
                                result.valid = true
                                resolve(result)
                            }
                        }
                    }
                } else {
                    console.log("notAvailable");
                    resolve({ notAvailable: true })
                }
            } catch (error) {
                reject(error)
            }
        })
    },

    getOrder: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orderDetails = await db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
                resolve(orderDetails)
            } catch (error) {
                reject(error)
            }
        })
    },

    filteredProducts: (filter, price) => {
        return new Promise((resolve, reject) => {
            try {
                if (filter.length > 1) {
                    db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                        {
                            $match: {
                                $or: filter
                            }
                        },
                        {
                            $match: {
                                Price: { $lt: price }
                            }
                        }
                    ]).toArray()
                        .then((products) => {

                            console.log(products, 'products')
                            resolve(products)
                        }).catch((error) => {
                            reject(error)
                        })
                } else {
                    db.get().collection(collections.PRODUCT_COLLECTION).aggregate([
                        {
                            $match:
                            {
                                Price: { $lt: price }
                            }
                        }
                    ]).toArray()
                        .then((products) => {
                            resolve(products)
                        }).catch((error) => {
                            reject(error)
                        })
                }
            } catch (error) {
                reject(error)
            }
        })
    }
}

