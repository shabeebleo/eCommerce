
var express = require('express');
var adminHelpers = require('../helpers/admin-helpers');
var fs = require('fs')
var path = require('path')
const { FindOperators } = require('mongodb');

module.exports = {
  getLoginpage: function (req, res) {
    res.render('admin/page-login', { layout: 'admin-layout' })
  },

  postLoginpage: (req, res) => {
    adminHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        res.redirect('/admin/adminHome')
      } else {
        res.redirect('/admin')
      }
    })
  },

  getAdminHome: function (req, res) {
    res.render('admin/admin-home', { layout: 'admin-layout', admin: true });
  },

  getOrders: function (req, res) {
    adminHelpers.getUserOrders().then((orders) => {
      res.render('admin/orders', { layout: 'admin-layout', orders, admin: true })

    })
  },



  getPlacedOrders: function (req, res) {
    adminHelpers.getUserPlacedOrders().then((orders) => {
      res.render('admin/placedOrders', { layout: 'admin-layout', orders, admin: true })

    })
  },

  changeOrderStatus: (req, res) => {
   console.log(req.body, "pppppppppttttttpppppppp");
    let statusUpdate = req.body.status
    let orderId = req.body.orderId
    adminHelpers.changeOrderStatus(orderId, statusUpdate).then((response) => {
      res.json(response)
    })
  },



  getOrderedProducts: async function (req, res) {
    let totalAmount = await adminHelpers.getUserOrdersdetails(req.params.id)
    await adminHelpers.getOrderedProducts(req.params.id).then((OrderedProducts) => {
      res.render('admin/viewOrderedProducts', { layout: 'admin-layout', totalAmount, OrderedProducts, admin: true })
    })
  },
  getPlacedOrderedProducts: async function (req, res) {
    let totalAmount = await adminHelpers.getUserOrdersdetails(req.params.id)
    await adminHelpers.getPlacedOrderedProducts(req.params.id).then((OrderedProducts) => {
      res.render('admin/viewPlacedOrderedProducts', { layout: 'admin-layout', totalAmount, OrderedProducts, admin: true })
    })
  },


  getUsers: function (req, res) {
    adminHelpers.getAllUsers().then((users) => {
      res.render('admin/users', { layout: 'admin-layout', admin: true, users })
    })
  },

  getBlockUser: function (req, res) {
    adminHelpers.blockUser(req.params.id)
    res.redirect('/admin/users')
  },

  getUnblockUser: function (req, res) {
    adminHelpers.unblockUser(req.params.id)
    res.redirect('/admin/users')
  },

  getAddProduct: function (req, res) {
    adminHelpers.getAllCategories().then((allCategories) => {
      res.render('admin/addProduct', { layout: 'admin-layout', admin: true, allCategories })
    })
  },

  postAddProduct: function (req, res) {
    const images = [];
    for (i = 0; i < req.files.length; i++) {
      images[i] = req.files[i].filename;
    }
    req.body.images = images
    adminHelpers.insertProducts(req.body)
    res.redirect('/admin/addProduct')
  },

  getViewProducts: function (req, res) {
    adminHelpers.getAllProducts().then((allProducts) => {
      res.render('admin/viewProducts', { layout: 'admin-layout', admin: true, allProducts })
    })

  },

  getDeleteProduct: function (req, res) {
    adminHelpers.deleteProduct(req.params.id)
    res.redirect('/admin/viewProducts')
  },

  getEditProduct: async (req, res) => {
    let fullcategories = await adminHelpers.getAllCategories();
    let productDetails = await adminHelpers.getproductDetails(req.params.id);
    for (i = 0; i < fullcategories.length; i++) {
      if (productDetails.Categories == fullcategories[i].category) {
        fullcategories[i].flag = true;
      }
    }

    res.render('admin/editProduct', { layout: 'admin-layout', admin: true, productDetails, fullcategories })
  },

  postEditProduct: (req, res) => {
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
    })
    res.redirect('/admin/viewProducts')
  },

  getCategories: function (req, res) {
    adminHelpers.getAllCategories().then((allCategories) => {
      res.render('admin/categories', { layout: 'admin-layout', admin: true, allCategories })
    })


  },
  postCategories: function (req, res) {
    adminHelpers.insertCategories(req.body)
    res.redirect('/admin/categories')
  },

  getDeleteCategory: (req, res) => {
    adminHelpers.delCategory(req.params.id)
    res.redirect('/admin/categories')
  },

  getCoupons:(req,res)=>{
    adminHelpers.getAllcoupons().then((allCoupons)=>{
      res.render('admin/coupons',{ layout: 'admin-layout',allCoupons, admin: true})

    })
  },

  postCoupons:(req,res)=>{
    adminHelpers. postCoupons(req.body)
    res.redirect('/admin/coupons')
  },

  delcoupon:(req,res)=>{
    let coupId=req.params.id
    adminHelpers.delcoupon(coupId)
    res.redirect('/admin/coupons')
  }

}