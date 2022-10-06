
var userHelpers = require('../helpers/user-helpers')
var twilioHelpers = require('../helpers/twilio-helper')
const { response } = require('express')
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding')
// var adminHelpers = require('../helpers/admin-helpers');
let allFilteredProducts

module.exports = {
  getSignUp: function (req, res) {
    res.render('user/signUp')
  },

  postSignUp: function (req, res) {
    twilioHelpers.doSms(req.body).then((data) => {
      req.session.body = req.body
      if (data) {
        res.render('/otp')
      } else {
        res.redirect('/signUp')
      }
    })
  },

  postOtp: (req, res, next) => {
    twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
      userHelpers.doSignup(req.session.body).then((response) => {
        res.redirect('/login')
      })
    })
  },

  getLogin: function (req, res) {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render('user/login');
    }
  },

  postLogin: async function (req, res) {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user;

        res.redirect('/')
      } else {
        res.redirect('/login')
      }
    })
  },

  getProfile: async function (req, res) {
    userId = req.session.user._id
    let userDetails = await userHelpers.getUserDetails(userId)
    let userAddress = await userHelpers.getAllAddress(userId)
    res.render('user/profile', { user: true, userDetails, userAddress })

  },


  postEditProfile: function (req, res) {
    var userId = req.params.id
    editedProfileDetails = req.body
    userHelpers.postEditProfile(userId, editedProfileDetails).then(() => {

      req.session.user.username = editedProfileDetails.name

      res.redirect('/profile')

    })
  },

  postaddAddress: (req, res) => {
    var userId = req.params.id
    let address = req.body
    userHelpers.postaddAddress(userId, address)
    res.redirect('/profile')
  },

  postDeleteAddress: (req, res) => {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = userHelpers.postDeleteAddress(userId, addressId)
    res.json(response)
    res.redirect('/profile')
  },

  CurrentAddress: async (req, res) => {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = await userHelpers.postCurrentAddress(userId, addressId)

    res.json(response)

  },

  getDeliveryAddress: async (req, res) => {
    let userId = req.body.user
    let addressId = req.body.addressId
    let response = await userHelpers.getDeliveryAddress(userId, addressId)
    res.json(response)
  },

  posteditaddress: (req, res) => {

    userHelpers.posteditaddress(req.body).then((response) => {
      res.json(response)
    })
  },

  getHomepage: async function (req, res) {
    userDetails = req.session.user
    if (userDetails) {
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    userHelpers.getAllProducts().then((allProducts) => {
      res.render('user/user-home', { user: true, userDetails, wishlistCount, cartCount, allProducts })
    })
  },


  searchProduct: async (req, res, next) => {
    try {
      let key = req.body.key;
      allFilteredProducts = await userHelpers.searchProducts(key)
      res.redirect('/shopcategory')
    } catch (error) {
      next(error)
    }

  },



  getProductDetails: async (req, res) => {
    const userDetails = req.session.user
    if (userDetails) {

      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    }
    userHelpers.proDetails(req.params.id).then((productDetails) => {
      res.render('user/productDetails', { productDetails, user: true, wishlistCount, cartCount: req.session.cartVolume, userDetails })
    })
  },

  getShopCategory: async (req, res) => {
    try {
      if (req.session.user) {
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
        req.session.cartVolume = cartCount;
        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      }
      const allCategories = await userHelpers.getAllCat()
      res.render('user/shopCategory', { user: true, allProducts: allFilteredProducts, cartCount, wishlistCount, userDetails: req.session.user, allCategories })

    } catch (error) {
      console.log(error);
      res.redirect('/')
    }

  },

  shopALL: async (req, res) => {
    allFilteredProducts = await userHelpers.getAllProducts()
    res.redirect('/shopCategory')
  },

  getMenCategory: (req, res) => {
    userHelpers.getAllProductsCat("Men").then((allCatProducts) => {
      let category = "Men"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getWomenCategory: (req, res) => {
    userHelpers.getAllProductsCat("Women").then((allCatProducts) => {
      let category = "Women"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getKidsCategory: (req, res) => {
    userHelpers.getAllProductsCat("kids").then((allCatProducts) => {
      let category = "kids"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getUnisexCategory: (req, res) => {
    userHelpers.getAllProductsCat("Unisex").then((allCatProducts) => {
      let category = "Unisex"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    })
  },

  getLogout: function (req, res) {
    req.session.loggedIn = false
    req.session.user = null
    res.redirect('/')
  },



  getAddToCart: function (req, res) {
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })

    })

    // res.redirect('/shopCategory')
  },


  getCart: async function (req, res, next) {
    var userDetails = req.session.user
    let cartCount = null
    if (userDetails) {
      var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let cartCount = await userHelpers.getCartCount(req.session.user._id)
      let products = await userHelpers.getCartProducts(req.session.user._id)
      if (products.length > 0) {
        totalValue = await userHelpers.getTotalAmount(req.session.user._id)
        // totalValueAfterCoupon=await userHelpers.totalValueAfterCoupon(req.session.user._id)
      } else {
        totalValue = 0
      }
      res.render('user/cart', { userDetails, totalValue, wishlistCount, cartCount, user: true, products })
    } else {
      res.redirect('/login')
    }
  },


  getAddToWishlist: function (req, res) {
    userHelpers.addToWishlist(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })

    })
  },


  getWishlist: async function (req, res, next) {
    var userDetails = req.session.user
    let wishlistCount = null
    if (userDetails) {
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
      req.session.cartVolume = cartCount;
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let products = await userHelpers.getWislistProducts(req.session.user._id)
      res.render('user/wishlist', { userDetails, cartCount, wishlistCount, user: true, products })
    } else {
      res.redirect('/login')
    }
  },

  postChangeProductQuantity: async (req, res) => {
    try {
      let response = await userHelpers.changeProductQuantity(req.body)
      response.proTotal = await userHelpers.postProTotal(req.body.user, req.body.product)
      response.total = await userHelpers.getTotalAmount(req.session.user._id)
      res.json(response)
    } catch (error) {
      console.log(error);
      res.redirect('/')
    }
  },

  postdelCartPro: async (req, res) => {
    try {
      const response = await userHelpers.delCartPro(req.body)
      res.json(response)
    } catch (error) {
      res.redirect('/')
    }


  },


  postdelWishlistPro: async (req, res) => {
    try {
      const response = await userHelpers.delWishlistPro(req.body)
      res.json(response)
    } catch (error) {
      res.redirect('/')
    }
  },

  getCheckOut: async (req, res) => {
    try {
      if (req.session.user) {
        let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
        let totalValue = await userHelpers.getTotalAmount(req.session.user._id)

        let products = await userHelpers.getCartProducts(req.session.user._id)
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
        let userAddress = await userHelpers.getAllAddress(req.session.user._id)
        res.render('user/checkout', { totalValue, user: true, wishlistCount, userAddress, products, cartCount, userDetails: req.session.user })
      }

    } catch (error) {
      console.log(error);
      res.redirect('/')

    }
  },

  postCheckout: async (req, res) => {
    console.log(req.body, "orderDetailsssssssssss");
    let couponName = req.body.couponName
    console.log(req.body.couponName, "ooooohha");
    let order = req.body
    console.log(order, "jjjjjcontroletr");
    products = await userHelpers.getCartProductList(req.body.userId)
    totalPrice = await userHelpers.getTotalAmount(req.body.userId)
    let grandTotal=order.grandTotal
    grandTotal=parseInt(grandTotal)

    userHelpers.placeOrder(order, products, couponName, totalPrice).then((orderId) => {
      if (req.body['Payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      } else {
        userHelpers.generateRazorpay(orderId, grandTotal).then((response) => {
          res.json(response)
        })
      }
    })

  },

  getOrderplaced: async (req, res) => {
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    res.render('user/orderSuccess', { user: true, wishlistCount, cartCount, userDetails: req.session.user })
  },


  postVerifyPayment: (req, res) => {
    console.log(req.body, "postVerifyPayment");
    userHelpers.postVerifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log("Payment-successfull");
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" })
    })
  },

  getviewOrders: async (req, res) => {
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    userHelpers.getUserOrders(req.session.user._id).then((orders) => {
      res.render('user/orders', { user: true, wishlistCount, orders, cartCount, userDetails: req.session.user })
    })
  },


  returnStatus: (req, res) => {
    userHelpers.returnStatus(req.params.id)
    res.redirect('/orders')
  },


  cancelStatus: (req, res) => {
    userHelpers.cancelStatus(req.params.id)
    res.redirect('/orders')
  },

  getViewproducts: async (req, res) => {
    let orderId = req.params.id
    var cartCount = await userHelpers.getCartCount(req.session.user._id)
    let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
    let orders = await userHelpers.getUserSpecificOrders(orderId)
    let totalOrderAmount = orders.totalAmount
    userHelpers.getOrderProducts(orderId).then((products) => {
      res.render('user/viewOrderedProducts', { user: true, wishlistCount, products, totalOrderAmount, cartCount, userDetails: req.session.user })

    })
  },

  postapplyCoupon: (req, res) => {
    console.log(req.body, "hai");
    let coupon = req.body.coupon
    let userId = req.body.userId
    console.log(coupon, userId, "llooll");
    userHelpers.postapplyCoupon(coupon, userId).then((response) => {

      if (response.coupon) {
        req.session.coupon = response

      }



      console.log(req.session.coupon, "coup details");
      console.log(response, "kkkpkk");
      res.json(response)
    })
  },

  getInvoice: async (req, res) => {
    let order = await userHelpers.getOrder(req.params.id)
    let products = await userHelpers.getOrderProducts(req.params.id)
    res.render('user/invoice', { order, products })
  },

  sortAndFilter: (req, res) => {
    const detail = req.body;
    console.log(detail, "detail");
    const price = parseInt(detail.price)
    const filter = [];
    for (i of detail.categoryName) {
      filter.push({ 'Categories': i })
    }
    console.log(filter, 'filter');

    userHelpers.filteredProducts(filter, price).then((response) => {
      allFilteredProducts = response;
      console.log(allFilteredProducts, "allFilteredProductsController");
      if (detail.sort == 'Sort') {
        res.json({ status: true });
      }
      if (detail.sort == 'lh') {
        allFilteredProducts.sort((a, b) => a.Price - b.Price)
        res.json({ status: true });
      }
      if (detail.sort == 'hl') {
        allFilteredProducts.sort((a, b) => b.Price - a.Price)
        res.json({ status: true });
      }
      if (detail.sort == 'az') {
        allFilteredProducts.sort(function (a, b) {
          return (a.Brand < b.Brand) ? -1 : (a.Brand > b.Brand) ? 1 : 0;
        })
        res.json({ status: true });
      }
      if (detail.sort == 'za') {
        allFilteredProducts.sort(function (a, b) {
          return (a.Brand > b.Brand) ? -1 : (a.Brand < b.Brand) ? 1 : 0;
        })
        res.json({ status: true });
      }
    })
  }
}

