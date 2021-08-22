const mongoose=require('mongoose');
const slugify=require('slugify');
const validator=require('validator');
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        maxlength:[40,'a tour must have lesst than 40 chars'],
        minlength:[10,'a tour name must have atleast 10 chars'],
        //validate:[validator.isAlpha,'tour name must be alphabets only']
    },
    slug:String,
    duration:{
        type:Number,
        required:[true,'a tour must have a duration']
    },
    maxGroupSize:{
        type:Number,
        required:[true,'a tour must specify a group size']
    },
    difficulty:{
        type:String,
        required:[true,'A tour must have difficulty'],
        enum:{values:['easy','medium','difficult'],message:'difficulty is only 3 types'}
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'a tour have atleast rating of 1'],
        max:[5,'a tour have atmost rating of 5'],
        set:val=>Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true,'A tour must have a price']
    },
    rating:{
        type:Number,
        default:4.5
    },
    priceDiscount:{
       type: Number,
    validate:{
     ///this only points to current doc on new doc creation
        validator:function(val){
            return val<this.price
        },
        message:'discount ({value}) must be less than price'
    }
    },
    summary:{
        type:String,
        trim:true,
        required:[true,'a tour must have a summary']
    },
    description:{
        type:String,
        trim:true
    },
    imageCover:{
        type:String,
        required:[true,'A tour must have a cover image']
    },
    images:[String],

    createdAt:{
        type:Date,
        default:Date.now()
    },
    startDates:[Date],
    secretTour:{
        type:Boolean,
        default:false
    },

    startLocation:{
     //GeoJson
     type:{
         type:String,
         default:'Point',
         enum:['Point']
     },
     coordinates:[Number],
     address:String,
     description:String
    },
    locations:[
        {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
        }
    ],
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }
    ]

},
    
   
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
}
    

);


tourSchema.index({price:1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'})

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
});

//////virtual population
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
});

/////Document middleware runs before save() and create()
tourSchema.pre('save',function(next){
this.slug=slugify(this.name,{lower:true});
next();
});
// tourSchema.post('save',function(doc,next){
//     console.log(doc);
//     next();
// })


////////QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next){
this.find({secretTour:{$ne:true}});
this.start=Date.now();
next();
});

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
    });
    next();
});

//////
tourSchema.post(/^find/,function(doc,next){
    console.log(`query took ${Date.now()-this.start}`);
    next();
    });

    ////AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
//     console.log(this.pipeline());
//     next();
// })

const Tour=mongoose.model('Tour',tourSchema)

module.exports=Tour;

