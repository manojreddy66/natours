
const Review = require("../models/reviewModel");
const catchAsync=require('./../utils/catchAsync');
const factory=require('./handlersFactory');

    


    // exports.getAllreviews=catchAsync(async (req,res,next)=>{
    //     let filter={};
    //     if(req.params.tourid) filter={tour:req.params.tourid};
    //     const reviews=await Review.find(filter);
    //     res.status(200).json({
    //         status:"sucess",
    //         results:reviews.length,
    //         data:{
    //             reviews
    //         }
    //     })
    //     });

        
        exports.setTouruserIds=(req,res,next)=>{
            if(!req.body.tour) req.body.tour=req.params.tourid;
            if(!req.body.user) req.body.user=req.user.id;
            next();
            }
        
            
        exports.createReview=factory.createOne(Review);
        exports.deleteReview=factory.deleteOne(Review);
        exports.updateReview=factory.updateOne(Review);
        exports.getReview=factory.getOne(Review);
        exports.getAllReviews=factory.getAll(Review);