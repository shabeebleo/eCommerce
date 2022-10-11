
var express = require('express');
var adminHelpers = require('../helpers/admin-helpers');
var fs = require('fs')
var path = require('path')
const { FindOperators } = require('mongodb');
const { rejects } = require('assert');


module.exports = {
  getLoginpage: function (req, res, next) {
    try {
      res.render('admin/page-login', { layout: 'admin-layout' })
    } catch (error) {
      console.log(error, "getLoginpage");
      next(error)
    }
  },

  // postLoginpage: (req, res, next) => {

  //   adminHelpers.doLogin(req.body).then((response) => {
  //     if (response.status) {
  //       req.session.adminLoggedIn = true
  //       req.session.admin = response.admin
  //       res.redirect('/admin/adminHome')
  //     } else {
  //       res.redirect('/admin')
  //     }
  //   }).catch((error) => {
  //     console.log(error, "doLogin");
  //     next(error)
  //   })

  // },

  postLoginpage: async (req, res, next) => {
    try {
      let adminlogin = {
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      }
        let data = req.body
        if (data.name == adminlogin.username) {
            if (data.password == adminlogin.password) {
                req.session.adminLoggedIn = true
                req.session.admin = data
                res.redirect('/admin/adminHome')
            } else {
                res.redirect('/admin')
            }
        } else {
            res.redirect('/admin')
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
},

  getAdminHome: async function (req, res, next) {
    try {
      // let getAllSales = await adminHelpers.getAllSales()
      let userCount = await adminHelpers.userCount()
      let orderCount = await adminHelpers.orderCount()
      adminHelpers.getOverAllSale().then((Revenue) => {
        res.render('admin/admin-home', { layout: 'admin-layout', getAllSales, userCount, orderCount, Revenue, admin: true });

      }).catch((error) => {
        console.log(error, "getOverAllSale");
        next(error)
      })
    } catch (error) {
      console.log(error, "getAdminHome");
      next(error)
    }
  },

  TotalRevenueGraph:async (req, res) => {
    try {
        let response = await adminHelpers.getTotalRevenue()
        res.json(response)
    } catch (error) {
        console.log(error)
        next(error)
    }

},

  // TotalRevenuePie: (req, res, next) => {
  //   adminHelpers.getTotalRevenuePie().then((response) => {
  //     res.json(response)
  //   }).catch((error) => {
  //     console.log(error, "getTotalRevenuePie");
  //     next(error)
  //   })



  // },

  // monthlySalesLineChart: async (req, res, next) => {
  //   try {
  //     let getOverAllSale = await adminHelpers.getOverAllSale()
  //     adminHelpers.getMonthlySalesLineChart(getOverAllSale).then((response) => {
  //       res.json(response)
  //     }).catch((error) => {
  //       console.log(error, "getMonthlySalesLineChart");
  //       next(error)
  //     })
  //   } catch (error) {
  //     console.log(error, "monthlySalesLineChart");
  //     next(error)
  //   }

  // },

  // catSalesDonut: async (req, res, next) => {
  //   try {
  //     let allCategories = await adminHelpers.getAllCategories()
  //     let catNames = []
  //     catNames[0] = allCategories[0].category
  //     catNames[1] = allCategories[1].category
  //     catNames[2] = allCategories[2].category
  //     catNames[3] = allCategories[3].category
  //     let allCatRevenues = []
  //     let menCategoryRevenue = await adminHelpers.categoryRevenue(catNames[0])
  //     let womenCategoryRevenue = await adminHelpers.categoryRevenue(catNames[1])
  //     let kidsCategoryRevenue = await adminHelpers.categoryRevenue(catNames[2])
  //     let unisexCategoryRevenue = await adminHelpers.categoryRevenue(catNames[3])
  //     allCatRevenues[0] = menCategoryRevenue
  //     allCatRevenues[1] = womenCategoryRevenue
  //     allCatRevenues[2] = kidsCategoryRevenue
  //     allCatRevenues[3] = unisexCategoryRevenue
  //     res.json(allCatRevenues)

  //   } catch (error) {
  //     console.log(error, "catSalesDonut");
  //     next(error)
  //   }
  // },




  getOrders: function (req, res, next) {

    adminHelpers.getUserOrders().then((orders) => {
      res.render('admin/orders', { layout: 'admin-layout', orders, admin: true })
    }).catch((error) => {
      console.log(error, "getUserOrders");
      next(error)
    })
  },



  getPlacedOrders: function (req, res, next) {
    adminHelpers.getUserPlacedOrders().then((orders) => {
      res.render('admin/placedOrders', { layout: 'admin-layout', orders, admin: true })
    }).catch((error) => {
      console.log(error, "getUserPlacedOrders");
      next(error)
    })

  },

  changeOrderStatus: (req, res, next) => {

    let statusUpdate = req.body.status
    let orderId = req.body.orderId
    adminHelpers.changeOrderStatus(orderId, statusUpdate).then((response) => {
      res.json(response)
    }).catch((error) => {
      console.log(error, "changeOrderStatus");
      next(error)
    })

  },



  getOrderedProducts: async function (req, res, next) {
    try {
      let totalAmount = await adminHelpers.getUserOrdersdetails(req.params.id)
      await adminHelpers.getOrderedProducts(req.params.id).then((OrderedProducts) => {
        res.render('admin/viewOrderedProducts', { layout: 'admin-layout', totalAmount, OrderedProducts, admin: true })
      }).catch((error) => {
        console.log(error, "getOrderedProducts");
        next(error)
      })
    } catch (error) {
      console.log(error, "getOrderedProducts");
      next(error)
    }
  },


  getPlacedOrderedProducts: async function (req, res, next) {
    try {
      let totalAmount = await adminHelpers.getUserOrdersdetails(req.params.id)
      await adminHelpers.getPlacedOrderedProducts(req.params.id).then((OrderedProducts) => {
        res.render('admin/viewPlacedOrderedProducts', { layout: 'admin-layout', totalAmount, OrderedProducts, admin: true })
      }).catch((error) => {
        console.log(error, "getPlacedOrderedProducts");
        next(error)
      })
    } catch (error) {
      console.log(error, "getUserOrdersdetails");
      next(error)
    }
  },


  getUsers: function (req, res, next) {

    adminHelpers.getAllUsers().then((users) => {
      res.render('admin/users', { layout: 'admin-layout', admin: true, users })
    }).catch((error) => {
      console.log(error, "getAllUsers");
      next(error)
    })
  },

  getBlockUser: function (req, res, next) {
    try {
      adminHelpers.blockUser(req.params.id)
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error, "getBlockUser");
      next(error)
    }
  },

  getUnblockUser: function (req, res, next) {
    try {
      adminHelpers.unblockUser(req.params.id)
      res.redirect('/admin/users')
    } catch (error) {
      console.log(error, "getUnblockUser");
      next(error)
    }
  },

  getAddProduct: function (req, res, next) {

    adminHelpers.getAllCategories().then((allCategories) => {
      res.render('admin/addProduct', { layout: 'admin-layout', admin: true, allCategories })
    }).catch((error) => {
      console.log(error, "getAllCategories");
      next(error)
    })

  },

  postAddProduct: function (req, res, next) {
    try {
      const images = [];
      for (i = 0; i < req.files.length; i++) {
        images[i] = req.files[i].filename;
      }
      req.body.images = images
      adminHelpers.insertProducts(req.body)
      res.redirect('/admin/addProduct')
    } catch (error) {
      console.log(error, "postAddProduct");
      next(error)
    }
  },

  getViewProducts: function (req, res, next) {

    adminHelpers.getAllProducts().then((allProducts) => {
      res.render('admin/viewProducts', { layout: 'admin-layout', admin: true, allProducts })
    }).catch((error) => {
      console.log(error, "getAllProducts");
      next(error)
    })

  },

  getDeleteProduct: function (req, res, next) {
    try {

      adminHelpers.deleteProduct(req.params.id)
      res.redirect('/admin/viewProducts')
    } catch (error) {
      console.log(error, "deleteProduct");
      next(error)
    }
  },

  getEditProduct: async (req, res, next) => {
    try {
      let fullcategories = await adminHelpers.getAllCategories();
      let productDetails = await adminHelpers.getproductDetails(req.params.id);
      for (i = 0; i < fullcategories.length; i++) {
        if (productDetails.Categories == fullcategories[i].category) {
          fullcategories[i].flag = true;
        }
      }
      res.render('admin/editProduct', { layout: 'admin-layout', admin: true, productDetails, fullcategories })
    } catch (error) {
      console.log(error, "getEditProduct");
      next(error)
    }
  },

  postEditProduct: (req, res, next) => {
    try {
      let id = req.params.id
      const editImg = []
      for (i = 0; i < req.files.length; i++) {
        editImg[i] = req.files[i].filename
      }
      req.body.images = editImg
      adminHelpers.editedProduct(id, req.body).then((oldImage) => {
        if (oldImage) {
          for (i = 0; i < oldImage.length; i++) {
            var oldImagepath = path.join(__dirname, '../public/admin/product-Images/' + oldImage[i])
            fs.unlink(oldImagepath, function (err) {
              if (err)
                return
            })
          }
        }
      }).catch((error) => {
        console.log(error, "editedProduct");
        next(error)
      })
      res.redirect('/admin/viewProducts')
    } catch (error) {
      console.log(error, "postEditProduct");
      next(error)
    }
  },

  getCategories: function (req, res, next) {

    adminHelpers.getAllCategories().then((allCategories) => {
      res.render('admin/categories', { layout: 'admin-layout', admin: true, allCategories })
    }).catch((error) => {
      console.log(error, "getAllCategories");
      next(error)
    })


  },
  postCategories: function (req, res, next) {
    try {
      adminHelpers.insertCategories(req.body)
      res.redirect('/admin/categories')
    } catch (error) {
      console.log(error, "postCategories");
      next(error)
    }

  },

  getDeleteCategory: (req, res, next) => {
    try {
      adminHelpers.delCategory(req.params.id)
      res.redirect('/admin/categories')
    } catch (error) {
      console.log(error, "getDeleteCategory");
      next(error)
    }

  },

  getCoupons: (req, res, next) => {

    adminHelpers.getAllcoupons().then((allCoupons) => {
      res.render('admin/coupons', { layout: 'admin-layout', allCoupons, admin: true })

    }).catch((error) => {
      console.log(error, "getAllcoupons");
      next(error)
    })

  },

  postCoupons: (req, res, next) => {
    try {
      adminHelpers.postCoupons(req.body)
      res.redirect('/admin/coupons')
    } catch (error) {
      console.log(error, "postCoupons");
      next(error)
    }

  },

  delcoupon: (req, res, next) => {
    try {
      let coupId = req.params.id
      adminHelpers.delcoupon(coupId)
      res.redirect('/admin/coupons')
    } catch (error) {
      console.log(error, "delcoupon");
      next(error)
    }

  },

  logout: (req, res, next) => {
    try {
      req.session.adminLoggedIn = false
      req.session.admin = null
      res.redirect('/admin')
    } catch (error) {
      console.log(error, "logout");
      next(error)
    }
  }

}