const { Router } = require('express');
var express = require('express');
var router = express.Router();
const multer = require('multer');
const { FindOperators } = require('mongodb');

const adminController=require('../controller/adminController')

// const { route } = require('./user');
/* GET users listing. */

// ..............multer.........//

const storage = multer.diskStorage({
  destination: "public/product-images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + '--' + file.originalname);
  },
});

const uploads = multer({
  storage
});

/* For Admin Session  */
const verifyAdmin = ((req, res, next) => {
  if (req.session.admin) {
    next()
  } else {
    res.redirect('/admin')
  }
})

const verifyLogout = ((req, res, next) => {
  if (req.session.admin) {
    res.redirect('/admin/adminHome')
    
  } else {
    next()  
  }
})


// ..............loginpage.........//
router.get('/',verifyLogout,adminController.getLoginpage)

// .......admin Login...........//
router.post('/',adminController.postLoginpage)

// ..............homepage.........//
router.get('/adminHome',verifyAdmin,adminController.getAdminHome);
router.post('/total-revenue',verifyAdmin,adminController.TotalRevenueGraph)
// router.post('/onlineCod',verifyAdmin,adminController.TotalRevenuePie)
// router.post('/monthlySales',verifyAdmin,adminController.monthlySalesLineChart)
// router.post('/catSales',verifyAdmin,adminController.catSalesDonut)

// ..............order........//
router.get('/orders',verifyAdmin,adminController.getOrders)
router.get('/viewOrderedProducts/:id',verifyAdmin,adminController.getOrderedProducts)
router.get('/orderList',verifyAdmin,adminController.getPlacedOrders)
router.post('/delivery-changeStatus',verifyAdmin,adminController.changeOrderStatus)


//.................coupons..........//
router.get('/coupons',verifyAdmin,adminController.getCoupons)
router.post('/coupons',verifyAdmin,adminController.postCoupons)
router.get('/deleteCoupons/:id',verifyAdmin,adminController.delcoupon)


// ..............user list .........//
router.get('/users',verifyAdmin,adminController.getUsers)

// ........blockUser.........//
router.get('/blockUser/:id',verifyAdmin,adminController.getBlockUser)

// ........unblockUser.........//
router.get('/unblockUser/:id', verifyAdmin,adminController.getUnblockUser)

// .......addProducts ...........//
router.get('/addProduct',verifyAdmin,adminController.getAddProduct )
router.post('/addProduct', uploads.array("image", 3), verifyAdmin,adminController.postAddProduct)

// ..............view products.........//
router.get('/viewProducts', verifyAdmin,adminController.getViewProducts)

// ..............Delete products.........//
router.get('/DeleteProduct/:id', verifyAdmin,adminController.getDeleteProduct)

// ..............edit products.........//
router.get('/editProduct/:id', verifyAdmin,adminController.getEditProduct)
router.post('/editProduct/:id',verifyAdmin,uploads.array('image',3),adminController.postEditProduct)


// ..............category.........//
router.get('/categories',verifyAdmin, adminController.getCategories)
router.post('/categories',verifyAdmin, adminController.postCategories)


/* For Logout */
router.get('/logout', adminController.logout)


/* For Admin Error Page */
router.use(function (req, res, next) {
  next(createError(404));
});

router.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('admin/admin-error', { layout: 'admin-layout' });
})

module.exports = router;
