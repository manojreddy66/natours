const crypto=require('crypto');
const {promisify}=require('util');
const User=require('../models/userModel');
const catchAsync=require('./../utils/catchAsync');
const jwt=require('jsonwebtoken');
const AppError=require('./../utils/appError');
const { env } = require('process');
const Email=require('./../utils/email');
const { token } = require('morgan');

const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'90d'
});
};

const createSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production') cookieOptions.secure=true;
    res.cookie('jwt',token,cookieOptions)
    //remove password from output
    user.password=undefined;
    res.status(statusCode).json({
        status:'sucess',
        token,
        data:{
            user
        }
    });
}
exports.signup= catchAsync(async (req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    });
    const url=`${req.protocol}://${req.get('host')}/me`;
    console.log(url)
    await new Email(newUser,url).sendWelcome();
    createSendToken(newUser,201,res);
    
});
exports.login=catchAsync(async(req,res,next)=>{
    const {email,password}=req.body

    //1 check if email and passwords exist
     if(!email||!password){
         return next(new AppError('please provide email and password',400));
     }
    //2check if user exist && password is correct
    const user=await User.findOne({email}).select('+password');
    //('password')===('$2b$12$ikBO90xdztOgA9VYnJC.bewsVdNRHfLIGYSG8VPMrJAb7BE4QDd7y')
   //const correct=await user.correctPassword(password,user.password);

   if(!user||!await user.correctPassword(password,user.password)){
       return next(new AppError('incorrect email or password',401))
   }
    //3if everything is okay send json web token to client
    createSendToken(user,200,res);
    
});


exports.logout=(req,res)=>{
    res.cookie('jwt','loggedout',{
        expires:new Date(Date.now()+10*1000),
        httpOnly:true
    
    });
    res.status(200).json({
        status:'success'
    })
}



exports.protect=catchAsync(async (req,res,next)=>{
    let token;
    //1 getting token and check its exists
    if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
   
   token=req.headers.authorization.split(' ')[1];
   
    }else if(req.cookies.jwt){
        token=req.cookies.jwt;
    }

    //console.log(token);
    if(!token){
        return next(new AppError('you are not loggedin,please login',401));
    };
    //2 verificate the token
 const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
 //console.log(decoded);
    //3check user if still exists
const currentUser=await User.findById(decoded.id);
if(!token){
    return next(new AppError('the user belongs to this token is no longer exists',401))
}
    //4check if user chnaged password after token was issued

if(currentUser.changedPasswordAfter(decoded.iat)){
    
    return next(new AppError('user changed password recently,please login again',401))
};

///Grant acces to proteed rout
req.user=currentUser;
res.locals.user=currentUser
    next();
});






//only for rendered pages,no errors
exports.isLoggedIn=async (req,res,next)=>{
    try{
    let token;
     if(req.cookies.jwt){
        token=req.cookies.jwt;
    
    //1verificate the token
 const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
 //console.log(decoded);
    //3check user if still exists
const currentUser=await User.findById(decoded.id);
if(!currentUser){
    return next()
}
    //4check if user chnaged password after token was issued

if(currentUser.changedPasswordAfter(decoded.iat)){
    
    return next()
};

///there is a logged in user
res.locals.user=currentUser;
   return  next();
}
    }catch(err){
    return next();
    }
next();
};






exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        //roles ['admin','lead-guide',] role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError('you do not have permission to perform this action',403))
        }
        next();
    };
};





exports.forgotPassword=catchAsync(async(req,res,next)=>{
//1 get user based on posted email
const user=await User.findOne({email:req.body.email});
if(!user){
    return next(new AppError('user does not found with this email adress',404))
}

//2 generate the random token and send as email
const resetToken=user.createPasswordResetToken();
await user.save({validateBeforeSave:false});

//send it to user's email
const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
console.log(resetUrl);
const message=`forgot your password? submit a patch request with your new password and passwordconfirm to :${resetUrl}.\n if you did not forgot your password,lease ignore this email`;

try{
    // await sendEmail({
    //     email:user.email,
    //     subject:'your password reset token (valid for 10 minutes only)',
    //     message
    // });
await new Email(user,resetUrl).sendPasswordreset();
    res.status(200).json({
        status:'sucess',
        message:'token sent to email'
    });

}catch(err){
    user.createPasswordResetToken=undefined,
    user.passwordResetExpires=undefined,
    await user.save({validateBeforeSave:false});
return next(new AppError('there was an error sending email.try again later!!'),500)
}
    



});

exports.resetPassword=catchAsync(async (req,res,next)=>{
   //1)get user based on the token
const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
//console.log(hashedToken);
 const user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});


//2)if token not expired,and there is user ,set the new password
if(!user){
    return next(new AppError('token has expired'),400);
}
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetExpires=undefined;
user.passwordResetToken=undefined;
await user.save();
//3)update the changedpasswordAt property 
//4)log the user user in ,send JWT
createSendToken(user,200,res); 
console.log(Date.now())
});


exports.updatePassword= catchAsync(async (req,res,next)=>{
    //1)get user from the colletion
   const user=await User.findById(req.user.id).select('+password');
    //2) chexk the user password is correct
 
 if( !(await user.correctPassword(req.body.currentPassword,user.password))){
     return next(new AppError('incorrect correct password'),401)
 };

    //3)if password is correct,update the password
    
    user.password=req.body.Password;
    user.passwordConfirm=req.body.passwordConfirm;
    await user.save();
//user.findByIdAndUpdate will not work as intended
     //4) log the user in,send jwt token
     createSendToken(user,200,res);
 
});