const fs=require('fs')
const path=require('path');
const express=require('express');
const morgan=require('morgan');
const rateLimit=require('express-rate-limit');
const helmet=require('helmet');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const hpp=require('hpp');
const cookieParser=require('cookie-parser');

const AppError=require('./utils/appError');
const globalErrorHandler=require('./controllers/errorController')
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewroutes');
const viewRouter=require('./routes/viewsRoutes')
const exp = require('constants');
/////////////////////////////////////1Middlewares
const app=express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

///serving static files
app.use(express.static(path.join(__dirname,'public')));

app.use((req,res,next)=>{
    console.log('hello from the middle ware');
next();
});

//body parser,reading data from bdoy to req.body
app.use(express.json({limit:'10kb'}));
app.use(cookieParser());

//test middleware
app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    //console.log(req.cookies);
    next();
});


//set security http headers middleware
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", 'https:', 'http:', 'data:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'http:', 'data:'],
        scriptSrc: ["'self'", 'https:', 'http:', 'blob:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:', 'http:'],
      },
    })
  );

//development loogin
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
};


//limit requests from same ip
const limiter=rateLimit({
    max:100,
    windows:60*60*1000,
    message:'too many requests from this ip,please try again in hour'
})

app.use('/api',limiter);



//data sanitization aginst nosql quey injextion 
app.use(mongoSanitize());

//datasanitising against xss
app.use(xss());

//prevent parameter pollution
app.use(hpp({
    whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price']
}))


///////////////////////////////////////////Route handlers

//////users

////////////////////////////////////////////// Routes


app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:'fail',
    //     message:`this route ${req.originalUrl} is not found on server`
    // })
    // const err=new Error(`this route ${req.originalUrl} is not found on server`);
    // err.status='fail';
    // err.statusCode=404;
    next(new AppError(`this route ${req.originalUrl} is not found on server`,404));
});
app.use(globalErrorHandler);
module.exports=app;
