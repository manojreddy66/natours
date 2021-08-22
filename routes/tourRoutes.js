const express=require('express');
const fs=require('fs');
const tourController=require('./../controllers/tourController')
const router=express.Router();
const authController=require('../controllers/authController');
const reviewController=require('../controllers/reviewController');


const reviewRouter=require('../routes/reviewroutes');

//router.route('/:tourid/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview)
router.use('/:tourid/reviews',reviewRouter);



//router.param('id',tourController.checkId);

router.route('/top-5-cheap').get(tourController.aliasTopTours,tourController.getAllTours);
router.route('/tour-stats').get(tourController.tourStats);
router.route('/monthly-plan/:year').get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);
router.route('/tours-within/:distance/center/:latlong/unit/:unit').get(tourController.getToursWithin);
router.route('/distances/:latlong/unit/:unit').get(tourController.getDistances);

router.route('/').get(tourController.getAllTours).post(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.createOne);
router.route('/:id').get(tourController.getTour).patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.uploadTourImages,tourController.reSizeTourImages,tourController.updateTour).delete(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.deleteTour);



module.exports=router;