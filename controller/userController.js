
var userHelpers = require('../helpers/user-helpers')
var twilioHelpers = require('../helpers/twilio-helper')
const { response } = require('express')
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding')
const Swal = require('sweetalert2')

let allFilteredProducts

module.exports = {

  getSignUp: function (req, res, next) {
    try {
      res.render('user/signUp')
    } catch (error) {
      console.log(error, "getSignUp");
      next(error)
    }
  },

  postSignUp: function (req, res, next) {

    twilioHelpers.doSms(req.body).then((data) => {
      req.session.body = req.body
      if (data) {
        res.redirect('/otp')
      } else {
        res.redirect('/signUp')
      }
    }).catch((error) => {
      console.log(error, "doSms");
    })

  },
  
  // postSignUp: function (req, res, next) {
  //   userHelpers.checkUserExist(req.body.email).then((response) => {
  //     if (response.userExist) {
  //       req.session.userExist = true
  //       res.redirect('/signUp')
  //     } else {
  //       twilioHelpers.doSms(req.body).then((data) => {
  //         req.session.body = req.body
  //         if (data) {
  //           res.redirect('/otp')
  //         } else {
  //           res.redirect('/signUp')
  //         }
  //       }).catch((error) => {
  //         console.log(error, "doSms");
  //       })
  //     }
  //   }).catch((error)=>{
  //     console.log(error, "checkUserExist");
  //     next(error)
  //   })

  // },


  getOtp: (req, res, next) => {
    try {
      res.render('user/otp', { invalid: req.session.invalidOtp })
    } catch (error) {
      console.log(error, "getOtp");
      next(error)
    }
  },

  postOtp: (req, res, next) => {
    try {
      twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
        if (response.valid) {
          userHelpers.doSignup(req.session.body).then((response) => {
            res.redirect('/login')
          }).catch((error) => {
            console.log(error, "doSignup");
            next(error)
          })
        } else {
          console.log("valid.valid.valid");
          req.session.invalidOtp = true
          res.redirect('/otp')
        }
      }).catch((error) => {
        console.log(error, "otpVerify");
        next(error)
      })
    } catch (error) {
      next(error)
    }

  },

  getLogin: function (req, res, next) {
    try {
      if (req.session.loggedIn) {
        res.redirect('/')
      } else {
        res.render('user/login');
      }
    } catch (error) {
      console.log(error, "getLogin");
      next(error)
    }
  },

  postLogin: async function (req, res, next) {
console.log(req.body,"gigigigig")
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true
        req.session.user = response.user;

        res.redirect('/')
      } else {
        res.redirect('/login')
      }
    }).catch((error) => {
      console.log(error, "doLogin");
      next(error)
    })

  },

  getProfile: async function (req, res, next) {
    try {

      userId = req.session.user._id
      let userDetails = await userHelpers.getUserDetails(userId)
      let userAddress = await userHelpers.getAllAddress(userId)
      res.render('user/profile', { user: true, userDetails, userAddress })
    } catch (error) {
      console.log(error, "getProfile");
      next(error)
    }

  },


  postEditProfile: function (req, res, next) {
    try {

      var userId = req.params.id
      editedProfileDetails = req.body
      userHelpers.postEditProfile(userId, editedProfileDetails).then(() => {
        req.session.user.username = editedProfileDetails.name
        res.redirect('/profile')

      }).catch((error) => {
        console.log(error, "postEditProfile");
        next(error)
      })
    } catch (error) {
      console.log(error, "postEditProfile");
      next(error)
    }
  },

  postaddAddress: (req, res, next) => {
    try {

      var userId = req.params.id
      let address = req.body
      userHelpers.postaddAddress(userId, address)
      res.redirect('/profile')
    } catch (error) {
      console.log(error, "postaddAddress");
      next(error)
    }
  },

  changePassword: (req, res, next) => {
    try {
      const newPassword = req.body.newPassword
      let userId = req.session.user._id
      userHelpers.postChangePassword(newPassword, userId)
      res.redirect('/profile')

    } catch (error) {
      console.log(error, "changePassword");
      next(error)
    }
  },

  postDeleteAddress: (req, res, next) => {
    try {
      let userId = req.body.user
      let addressId = req.body.addressId
      let response = userHelpers.postDeleteAddress(userId, addressId)
      res.json(response)
      res.redirect('/profile')

    } catch (error) {
      console.log(error, "postDeleteAddress");
      next(error)
    }
  },

  CurrentAddress: async (req, res, next) => {
    try {
      let userId = req.body.user
      let addressId = req.body.addressId
      let response = await userHelpers.postCurrentAddress(userId, addressId)
      res.json(response)
    } catch (error) {
      console.log(error, "CurrentAddress");
      next(error)
    }


  },

  getDeliveryAddress: async (req, res, next) => {
    try {
      let userId = req.body.user
      let addressId = req.body.addressId
      let response = await userHelpers.getDeliveryAddress(userId, addressId)
      res.json(response)
    } catch (error) {
      console.log(error, "getDeliveryAddress");
      next(error)
    }

  },
  

  posteditaddress: (req, res, next) => {
    userHelpers.posteditaddress(req.body).then((response) => {
      res.json(response)
    }).catch((error) => {
      console.log(error, "posteditaddress");
      next(error)
    })

  },

  getHomepage: async function (req, res, next) {
    try {
      userDetails = req.session.user
      if (userDetails) {
        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
      }
      let allProductsSlide2 = await userHelpers.getProductsHome2(8)
      userHelpers.getProductsHome1(8).then((allProducts) => {
        res.render('user/user-home', { user: true, userDetails, wishlistCount, allProductsSlide2, cartCount, allProducts })
      }).catch((error) => {
        console.log(error, "getProductsHome1");
        next(error)
      })
    } catch (error) {
      console.log(error, "getHomepage");
      next(error)
    }

  },


  searchProduct: async (req, res, next) => {
    try {
      let key = req.body.key;
      allFilteredProducts = await userHelpers.searchProducts(key)
      res.redirect('/shopcategory')
    } catch (error) {
      console.log(error, "getHomepage");
      next(error)
    }

  },


  getProductDetails: async (req, res, next) => {
    try {
      const userDetails = req.session.user
      if (userDetails) {

        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      }
      userHelpers.proDetails(req.params.id).then((productDetails) => {
        res.render('user/productDetails', { productDetails, user: true, wishlistCount, cartCount: req.session.cartVolume, userDetails })
      }).catch((error) => {
        console.log(error, "proDetails");
        next(error)
      })
    } catch (error) {
      console.log(error, "getProductDetails");
      next(error)
    }
  },

  getShopCategory: async (req, res, next) => {
    try {
      if (req.session.user) {
        var cartCount = await userHelpers.getCartCount(req.session.user._id)
        req.session.cartVolume = cartCount;
        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      }
      const allCategories = await userHelpers.getAllCat()
      res.render('user/shopCategory', { user: true, allProducts: allFilteredProducts, cartCount, wishlistCount, userDetails: req.session.user, allCategories })

    } catch (error) {
      console.log(error, "getShopCategory");
      next(error)
    }

  },

  shopALL: async (req, res, next) => {
    try {
      allFilteredProducts = await userHelpers.getAllProducts()
      res.redirect('/shopCategory')

    } catch (error) {
      console.log(error, "getShopCategory");
      next(error)
    }
  },

  getMenCategory: (req, res, next) => {

    userHelpers.getAllProductsCat("Men").then((allCatProducts) => {
      let category = "Men"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    }).catch((error) => {
      console.log(error, "getAllProductsCat");
      next(error)
    })


  },

  getWomenCategory: (req, res, next) => {

    userHelpers.getAllProductsCat("Women").then((allCatProducts) => {
      let category = "Women"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    }).catch((error) => {
      console.log(error, "getAllProductsCat");
      next(error)
    })


  },

  getKidsCategory: (req, res, next) => {

    userHelpers.getAllProductsCat("kids").then((allCatProducts) => {
      let category = "kids"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    }).catch((error) => {
      console.log(error, "getAllProductsCat");
      next(error)
    })

  },

  getUnisexCategory: (req, res, next) => {

    userHelpers.getAllProductsCat("Unisex").then((allCatProducts) => {
      let category = "Unisex"
      var userDetails = req.session
      res.render('user/Category', { allCatProducts, user: true, userDetails, category })
    }).catch((error) => {
      console.log(error, "getAllProductsCat");
      next(error)
    })

  },




  getAddToCart: function (req, res, next) {

    userHelpers.addToCart(req.params.id, req.session.user._id).then((response) => {
      if (response.quantityLimit) {
        res.json({ limit: true })
      } else {
        res.json({ status: true })
      }

    }).catch((error) => {
      console.log(error, "addToCart");
      next(error)
    })


  },


  getCart: async function (req, res, next) {
    try {
      var userDetails = req.session.user
      let cartCount = null
      if (userDetails) {
        var wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
        let cartCount = await userHelpers.getCartCount(req.session.user._id)
        let products = await userHelpers.getCartProducts(req.session.user._id)
        if (products.length > 0) {
          totalValue = await userHelpers.getTotalAmount(req.session.user._id)
        } else {
          totalValue = 0
        }
        res.render('user/cart', { userDetails, totalValue, wishlistCount, cartCount, user: true, products })
      } else {
        res.redirect('/login')
      }

    } catch (error) {
      console.log(error, "getCart");
      next(error)
    }
  },


  getAddToWishlist: function (req, res, next) {

    userHelpers.addToWishlist(req.params.id, req.session.user._id).then((response) => {
      if (response.status) {
        res.json({ status: false })
      } else {
        res.json({ status: true })
      }

    }).catch((error) => {
      console.log(error, "addToWishlist");
      next(error)
    })

  },


  getWishlist: async function (req, res, next) {
    try {
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

    } catch (error) {
      console.log(error, "getWishlist");
      next(error)
    }
  },

  postChangeProductQuantity: async (req, res, next) => {
    try {
      let response = await userHelpers.changeProductQuantity(req.body)
      response.proTotal = await userHelpers.postProTotal(req.body.user, req.body.product)
      response.total = await userHelpers.getTotalAmount(req.session.user._id)
      res.json(response)
    } catch (error) {
      console.log(error, "postChangeProductQuantity");
      next(error)
    }
  },

  postdelCartPro: async (req, res, next) => {
    try {
      const response = await userHelpers.delCartPro(req.body)
      res.json(response)
    } catch (error) {
      console.log(error, "postdelCartPro");
      next(error)
    }

  },


  postdelWishlistPro: async (req, res, next) => {
    try {
      const response = await userHelpers.delWishlistPro(req.body)
      res.json(response)
    } catch (error) {
      console.log(error, "postdelWishlistPro");
      next(error)
    }
  },

  getCheckOut: async (req, res, next) => {
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
      console.log(error, "getCheckOut");
      next(error)
    }
  },

  postCheckout: async (req, res, next) => {
    try {
      let couponName = req.body.couponName
      let order = req.body
      products = await userHelpers.getCartProductList(req.body.userId)
      totalPrice = await userHelpers.getTotalAmount(req.body.userId)
      let grandTotal = order.grandTotal
      grandTotal = parseInt(grandTotal)

      userHelpers.placeOrder(order, products, couponName, totalPrice).then((orderId) => {
        if (req.body['Payment-method'] === 'COD') {
          res.json({ codSuccess: true })
        } else {
          userHelpers.generateRazorpay(orderId, grandTotal).then((response) => {
            res.json(response)
          }).catch((error) => {
            console.log(error, "generateRazorpay");
            error.error = true
            res.json(error)
          })
        }
      })

    } catch (error) {
      console.log(error, "postCheckout");
      next(error)
    }
  },

  getOrderplaced: async (req, res, next) => {
    try {
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      res.render('user/orderSuccess', { user: true, wishlistCount, cartCount, userDetails: req.session.user })
    } catch (error) {
      console.log(error, "getOrderplaced");
      next(error)
    }
  },


  postVerifyPayment: (req, res, next) => {
    userHelpers.postVerifyPayment(req.body).then(() => {
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err, "postVerifyPayment");
      res.json({ status: false, errMsg: "" })
    })
  },

  getviewOrders: async (req, res, next) => {
    try {
      let cartCount = null
      let wishlistCount = null
      if (req.session.user._id) {
        cartCount = await userHelpers.getCartCount(req.session.user._id)
        wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      }
      userHelpers.getUserOrders(req.session.user._id).then((orders) => {
        res.render('user/orders', { user: true, wishlistCount, orders, cartCount, userDetails: req.session.user })
      }).catch((error) => {
        console.log(error, "getUserOrders");
        next(error)
      })
    } catch (error) {
      console.log(error, "getviewOrders");
      next(error)
    }
  },


  returnStatus: (req, res, next) => {
    try {
      userHelpers.returnStatus(req.params.id)
      res.redirect('/orders')
    } catch (error) {
      console.log(error, "returnStatus");
      next(error)
    }
  },


  cancelStatus: (req, res, next) => {
    try {
      userHelpers.cancelStatus(req.params.id)
      res.redirect('/orders')
    } catch (error) {
      console.log(error, "cancelStatus");
      next(error)
    }
  },

  getViewproducts: async (req, res, next) => {
    try {
      let orderId = req.params.id
      var cartCount = await userHelpers.getCartCount(req.session.user._id)
      let wishlistCount = await userHelpers.getWishlistCount(req.session.user._id)
      let orders = await userHelpers.getUserSpecificOrders(orderId)
      let totalOrderAmount = orders.totalAmount
      userHelpers.getOrderProducts(orderId).then((products) => {
        res.render('user/viewOrderedProducts', { user: true, wishlistCount, products, totalOrderAmount, cartCount, userDetails: req.session.user })

      }).catch((error)=>{
        console.log(error,"getOrderProducts");
        next(error)
      })
    } catch (error) {
      console.log(error, "getViewproducts");
      next(error)
    }
  },

  postapplyCoupon: (req, res, next) => {
    try {
      let coupon = req.body.coupon
      let userId = req.body.userId
      let subtotal = req.body.subtotal
      userHelpers.postapplyCoupon(coupon, userId, subtotal).then((response) => {
        if (response.valid) {
          req.session.coupon = response
        }
        res.json(response)
      }).catch((error)=>{
        console.log(error,"postapplyCoupon");
        next(error)
      })

    } catch (error) {
      console.log(error,"postapplyCoupon");
      next(error)
    }
  },

  getInvoice: async (req, res, next) => {
    try {
      let order = await userHelpers.getOrder(req.params.id)
      let products = await userHelpers.getOrderProducts(req.params.id)
      res.render('user/invoice', { order, products })
    } catch (error) {
      console.log(error,"getInvoice");
      next(error)
    }
  },

  sortAndFilter: (req, res, next) => {
    try {
      const detail = req.body;
      const price = parseInt(detail.price)
      const filter = [];
      for (i of detail.categoryName) {
        filter.push({ 'Categories': i })
      }
      userHelpers.filteredProducts(filter, price).then((response) => {
        allFilteredProducts = response;
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
      }).catch(()=>{
        console.log(error,"filteredProducts");
      next(error)
      })
    } catch (error) {
      console.log(error,"sortAndFilter");
      next(error)
    }
  },

  getLogout: function (req, res, next) {
    try {
      req.session.loggedIn = false
      req.session.user = null
      res.redirect('/')
    } catch (error) {
      next(error)
    }
  }
}

