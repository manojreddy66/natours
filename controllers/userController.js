const User=require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const AppError=require('../utils/appError');
const { update } = require('../models/userModel');
const factory=require('./handlersFactory');
const sharp=require('sharp');
const multer=require('multer');

// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'public/img/users');
//     },
//     filename:(req,file,cb)=>{
//     const ext=file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });

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



exports.uploadUserPhoto=upload.single('photo');

exports.resizeUserPhoto=async (req,res,next)=>{
    if(!req.file) return next();
   req.file.filename= `user-${req.user.id}-${Date.now()}.jpeg`
await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);
next();
};




const filterObj=(obj,...allowedfields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedfields.includes(el)) newObj[el]=obj[el]
    });
    return newObj;
};

// exports. getAllUsers=catchAsync(async(req,res,next)=>{
//     const users=await User.find();
//     res.status(200).json({
//         status:'sucess',
//         results:users.length,
//         data:{
//             users
//         }
        
//     });
// });
exports. createUser=(req,res)=>{
    res.status(500).json({
        status:error,
        message:'this route is not yet defined,please use signup instead'
    });
};
exports.updateMe=catchAsync( async (req,res,next)=>{
    // console.log(req.file);
    // console.log(req.body);
//1) create an error if user try upadate password
if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('this route is not for password update,please use updatePassword'),400)
};

//2) update the user document
//only email and name can be updated,filtered out the unwanted fields
const filteredBody=filterObj(req.body,'email','name');
if(req.file) filteredBody.photo=req.file.filename;
const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});
res.status(200).json({
    status:'sucess',
    data:{
        user:updatedUser
    }
})
});

exports.deleteMe=catchAsync(async (req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false});
    res.status(204).json({
        status:"sucess",
        data:null
    })
})

exports.getMe=(req,res,next)=>{
req.params.id=req.user.id;
console.log(req.user.id);
next();
}

exports. getUser=factory.getOne(User);
//do not update passwords wit this
exports. updateUser=factory.updateOne(User);
exports. deleteUser=factory.deleteOne(User);
exports.getAllUsers=factory.getAll(User);