const express=require('express');
const reviewController=require('./../controllers/reviewController');
const authController=require('./../controllers/authController');
const router=express.Router({mergeParams:true});

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews).post(authController.restrictTo('user') ,reviewController.setTouruserIds, reviewController.createReview);
router.route('/:id').delete(authController.restrictTo('user'), reviewController.deleteReview).get(reviewController.getReview)
router.route('/:id').patch(authController.restrictTo('user'),reviewController.updateReview);

module.exports=router;