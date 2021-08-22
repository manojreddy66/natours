
const { listeners } = require('cluster');
const { listenerCount } = require('events');
const { json } = require('express');
const fs=require('fs');
const { find } = require('./../models/tourModel');
const Tour=require('./../models/tourModel')
const APIFeatures=require('./../utils/APIFeatures');
const catchAsync=require('./../utils/catchAsync');
const AppError=require('./../utils/appError');
const factory=require('./handlersFactory');
const sharp=require('sharp');
const multer=require('multer');

const multerStorage=multer.memoryStorage();

const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('not an image please upload only image',400),false)
    }
};



const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter,

});

exports. uploadTourImages=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
]);


exports. reSizeTourImages=async (req,res,next)=>{
    console.log(req.files);
    req.body.imageCover=`tour-${req.params.id}.${Date.now()}-cover.jpeg`;
    if(!req.files.imageCover || !req.files.images) return next();
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);
    
    //2)images
    req.body.images=[];
    
    await Promise.all(req.files.images.map(async (file,i) => {
        const filename=`tour-${req.params.id}.${Date.now()}-${i+1}.jpeg`;

        await sharp(file.buffer)
        .resize(2000,1333).toFormat('jpeg')
        .jpeg({quality:90})
        .toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }));
    next();
}


// exports.checkId=(req,res,next,val)=>{
//     if(req.params.id*1>tours.length)
//     {
//         return res.status(404).json({status:'failed',message:'invalid id'})
//     };
//     next();
// }
// exports. checkBody=(req,res,next)=>{
//     if(!req.body.name || !req.body.price){
//     return res.status(400).json({error:true,message:'missing name or price value on request'})
//     };
//     next();
    
//     }

exports.aliasTopTours=async(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next();
}


//////////////////////////////////////////////////////////////////////////////////////

// exports. getAllTours=catchAsync( async (req,res,next)=>{
//     ///////////////////execute query
//        const features=new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
//        const tours=await features.query;
//        ///send response
//         res.status(200).json({
//             status:'sucess',
//             requestedAt:req.requestTime,
//             results:tours.length,
//              data:{
//                 tours
//              }
//         });
    
//     });


    


// exports. createTour= catchAsync(async (req,res,next)=>{
    
//         //const newTour=new Tour({});
//     //newTour.save();
//     const newTour=await Tour.create(req.body);

//     res.status(201).json({
//         status:"sucess",
//         data:{
//             tour:newTour
//         }
//     });
    
// });

// exports. updateTour=catchAsync(async (req,res,next)=>{
    
//        const tour= await Tour.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
//        if(!tour){
//         return next(new AppError('no tour found with that id',404));
//     };
//     res.status(200).json({status:"sucess",data:{
//         tour
//     }})

// });
exports.getAllTours=factory.getAll(Tour);
exports. getTour= factory.getOne(Tour,{path:'reviews'});
exports.createOne=factory.createOne(Tour);
exports.updateTour=factory.updateOne(Tour);
exports.deleteTour=factory.deleteOne(Tour);


// exports. deleteTour=catchAsync(async (req,res,next)=>{
    
//        const tour= await Tour.findByIdAndDelete(req.params.id);
//        if(!tour){
//         return next(new AppError('no tour found with that id',404));
//     };
//     res.status(204).json({status:"sucess",data:
//         null
//     })

// });
exports.tourStats=catchAsync(async (req,res,next)=>{

const stats=await Tour.aggregate([
    {
        $match:{ratingsAverage:{$gte:4.5}}
    },
    {
        $group:{
            _id:'$difficulty',
            numTours:{$sum:1},
            numRatings:{$sum:'$ratingsQuantity'},
            avgRating:{$avg:'$ratingsAverage'},
            avgPrice:{$avg:'$price'},
            minPrice:{$min:'$price'},
            maxPrice:{$max:'$price'}
        }
    },
    {
        $sort:{avgPrice:1}
    }
    
]);
res.status(200).json({
    status:'sucess',
    data:{
        stats
    }
})

});
exports.getMonthlyPlan=catchAsync(async (req,res,next)=>{

    //console.log(new Date(2021-01-01)>new Date)
    
    const year=req.params.year*1;
    
    const plan=await Tour.aggregate([
        {
            $unwind:'$startDates'
        },
        {
            $match:{
                startDates:{
                    $gte: new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`)
                }
            },
        },
        {
            $group:{
                _id:{$month:'$startDates'},
                numOfTours:{$sum:1},
                tours:{$push:'$name'}
            }
        },
        {
            $addFields:{month:'$_id'}
        },
        {
            $project:{
                _id:0
            }
        },
        {
            $sort:{numOfTours:-1}
        }
    ]);
    res.status(200).json({
        status:"sucess",
        data:{
            plan
        }
        
        
    });
});

exports.getToursWithin= catchAsync(async (req,res,next)=>{
    const {distance,latlong,unit}=req.params;
    const [lat,long]=latlong.split(',');

    const radius=unit==='mi'?distance/3963.2:distance/6378.1;

if(!lat || !long){
    next(new AppError('please provide latitude and longitude'),400)
}
console.log(distance,lat,long,unit);

const tours=await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[long,lat],radius]}}})
res.status(200).json({
    status:"sucess",
    results:tours.length,
    data:{
        data:tours
    }
})
});

exports.getDistances=catchAsync( async (req,res,next)=>{
    const {latlong,unit}=req.params;
    const [lat,long]=latlong.split(',');

    const multiplier=unit==='mi'?0.000621371:0.001;

if(!lat || !long){
    next(new AppError('please provide latitude and longitude'),400)
};
const distances=await Tour.aggregate([
{
    $geoNear:{
        near:{
            type:'Point',
            coordinates:[long*1,lat*1]

        },
        distanceField:'distance',
        distanceMultiplier:multiplier
    }
},
{
    $project:{
        distance:1,
        name:1
    }
}

]);
res.status(200).json({
    status:"sucess",
    data:{
        data:distances
    }
})
});