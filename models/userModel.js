const mongoose=require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt');
const crypto=require('crypto');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'please tell us your name'],
        trim:true,
        maxlength:[40,'a name must be below 40 characters'],
    },
    email:{
        type:String,
        required:[true,'email is required'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail , 'email should be in correct format'],
        
    },
    photo:{type:String,
    default:'default.jpg'},
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type:String,
        required:[true,'pleas provide a password'],
        minlength:[8,'password must be atleast 8 characters'],
        select:false
        
    },
    passwordConfirm:{
        type:String,
        required:[true,'pleas confirm  password'],
        validate:{
            ///this only works on SAVE and CREATE!!!!!!!!!!!
            validator:function(el){
                return el===this.password
            },
            message:'password confirmation failed'
        },
        select:false
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }

});


userSchema.pre('save',async function(next){
    //only run this function if password actually modified
if(!this.isModified('password')) return next();

this.password=await bcrypt.hash(this.password,12);
//delete the password confirm feild no need to save in database
this.passwordConfirm=undefined;
next();
});

userSchema.pre('save',async function(next){
if(!this.isModified('password')||this.isNew) return next();
this.passwordChangedAt=Date.now()-1000;
next();
});

userSchema.pre(/^find/,async function(next){
    //this pionts to the current query
    this.find({active:{$ne:false}});
    next();
});

userSchema.methods.correctPassword=async function(candidatePassword,userPassword){
return await bcrypt.compare(candidatePassword,userPassword);
};
userSchema.methods.changedPasswordAfter=function(JWTTimestamp){
    if(this.passwordChandedAt){
       const changedTimestamp= parseInt(this.passwordChandedAt.getTime()/1000,10) ;
       console.log(changedTimeStamp,JWTTimestamp);
       return JWTTimestamp<changedTimestamp;
    }
    
///false means not changed.
    return false;
};
userSchema.methods.createPasswordResetToken=function(){
const resetToken=crypto.randomBytes(32).toString('hex');
this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
console.log({resetToken},this.passwordResetToken);
this.passwordResetExpires=Date.now()+10*60*1000;
return resetToken;
};
const User=mongoose.model('User',userSchema);
module.exports=User;