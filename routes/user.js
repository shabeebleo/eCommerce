var express = require('express');
var router = express.Router();
const userController = require('../controller/userController')

const adminController=require('../controller/adminController')
// const trial = (req,res,next) => {
//     console.log("...................")
//     next();
// } 



//  user signup  //
router.get('/signUp', userController.getSignUp)
router.post('/signUp', userController.postSignUp)
router.post('/otp', userController.postOtp)

//  user login  //.
router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);

//  user homepage    //
router.get('/', userController.getHomepage);  

//  user Profile  //
router.get('/profile', userController.getProfile);  
router.post('/editProfile/:id',userController.postEditProfile)        
router.post('/addAddress/:id',userController.postaddAddress)
router.post('/deleteAddress',userController.postDeleteAddress)      
router.post('/currentAddress',userController.CurrentAddress)
router.post('/editaddress',userController.posteditaddress)
router.post('/deliveryAddress',userController.getDeliveryAddress)

//  user shop   //
router.get('/shopCategory', userController.getShopCategory)
router.get('/shopALL',userController.shopALL)
router.post('/search-products',userController.searchProduct)
router.post('/products/filter',userController.sortAndFilter)
//  product details  //
router.get('/productDetails/:id', userController.getProductDetails)

//   category    //
router.get('/menCategory', userController.getMenCategory)
router.get('/womenCategory', userController.getWomenCategory)
router.get('/kidsCategory', userController.getKidsCategory)
router.get('/unisexCategory', userController.getUnisexCategory)

//   cart  //
router.get('/cart/:id',userController.getCart)
router.post('/delete-cart-product',userController.postdelCartPro)

//   add to cart  //
router.get('/addToCart/:id', userController.getAddToCart)

//   add to wishlist  //
router.get('/addToWishlist/:id', userController.getAddToWishlist)

// wishlist//
router.get('/wishList/:id',userController.getWishlist)
router.post('/delete-wishlist-product',userController.postdelWishlistPro)

//  user logout   //
router.get('/logout', userController.getLogout)

//change product quantity//
router.post('/change-product-quantity',userController.postChangeProductQuantity)

//checkOut Page//
router.get('/place-order',userController.getCheckOut)
router.post('/place-order',userController.postCheckout)
router.post('/verify-payment',userController.postVerifyPayment)

router.post('/applyCoupon',userController.postapplyCoupon)


//    order related   //

router.get('/orderPlaced', userController.getOrderplaced)
router.get('/orders',userController.getviewOrders)
router.get('/returnStatus/:id',userController.returnStatus)
router.get('/cancelStatus/:id',userController.cancelStatus)
router.get('/viewProducts/:id',userController.getViewproducts)
router.get('/invoice/:id',userController.getInvoice)
        


                         
module.exports = router;
