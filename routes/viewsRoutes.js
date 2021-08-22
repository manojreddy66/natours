const express=require('express');
const viewController=require('../controllers/viewsController');
const router=express.Router();
const authController=require('./../controllers/authController')




router.get('/',authController.isLoggedIn,viewController.getOverview);
router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour);
router.get('/login',authController.isLoggedIn,viewController.getLoginForm);
router.get('/me',authController.protect,viewController.getAccount);
router.post(
    '/submit-user-data',
    authController.protect,
    viewController.updateUserData
  );

module.exports=router;