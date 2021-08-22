const mongoose=require('mongoose');
const Tour=require('./tourModel');

const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:[true,'review cannot be empty']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required:[true,'review must belong to a tour']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:[true,'review must belong to a user']
    }

},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
);


reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name'

    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // })

    this.populate({
            path:'user',
           select:'name photo'
         })
    next();
});


reviewSchema.statics.calcAverageRatings= async function(tourid){
const stats=await this.aggregate([
    {
        $match:{tour:tourid}
    },
    {
        $group:{
            _id:'$tour',
            nRating:{$sum:1},
            avgRating:{$avg:'$rating'}
        }
    }
])
console.log(stats);
if(stats.length>0) {
    await Tour.findByIdAndUpdate(tourid,{ratingsQuantity:stats[0].nRating,ratingsAverage:stats[0].avgRating})
}else {
    await Tour.findByIdAndUpdate(tourid,{ratingsQuantity:0,ratingsAverage:4.5})
}

};

reviewSchema.post('save',function(){
    //this points to the current review
    this.constructor.calcAverageRatings(this.tour);
    
});

reviewSchema.pre(/^findOneAnd/,async function(next){
     this.r=await this.findOne();
    console.log(this.r);
    next();
})

reviewSchema.post(/^findOneAnd/,async function(){
    
    await this.r.constructor.calcAverageRatings(this.r.tour)
    
})


const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;
