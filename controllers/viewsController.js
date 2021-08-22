const Tour=require('../models/tourModel');
const user=require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const User=require('./../models/userModel');
const AppError=require('./../utils/appError');

exports.getOverview= catchAsync(async (req,res)=>{
    //1)get tour data from collection
   const tours=await Tour.find();
    //2)build template
    //3)render the template using the data from one
    res.status(200).render('overview',{
        title:'All tours',
        tours
    })
});


exports.getTour=catchAsync(async (req,res,next)=>{
//1)get the data,for the requested data(including reviews and gide)
const tour=await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'review rating user'
   });
   if(!tour){
       return next(new AppError('there is no tour with that name',404))
   }
    res.status(200).set('Content-Security-Policy','connect-src https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com').render('tour',{
        title:tour.name,
        tour
    })
});

exports.getLoginForm=catchAsync(async(req,res)=>{

    res.status(200)
    .render('login',{title:'log into your account'})
 
});


exports.getAccount=(req,res,next)=>{
    res.status(200)
    .render('account',{title:' your account'})
}

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });
  