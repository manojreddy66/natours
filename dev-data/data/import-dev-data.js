const fs=require('fs')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const Tour=require('./../../models/tourModel');
const User=require('./../../models/userModel');
const Review=require('./../../models/reviewModel');


dotenv.config({path:'./config.env'})




const db=process.env.DB.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(db,{useNewUrlParser:true,useCreateIndex:true,useFindAndModify:false,useUnifiedTopology:true}).then(con=>{
    //console.log(con.connections);
    console.log('Data Base connections sucessfull')
});

/////Read json file
const tours=JSON.parse(fs.readFileSync('./dev-data/data/tours.json','utf-8'));
const users=JSON.parse(fs.readFileSync('./dev-data/data/users.json','utf-8'));
const reviews=JSON.parse(fs.readFileSync('./dev-data/data/reviews.json','utf-8'));
//////import data into database
const importData=async()=>{
    try{
       await Tour.create(tours);
       await User.create(users,{validateBeforeSave:false});
       await Review.create(reviews);
       console.log('data suceesfully loaded');
       
    }catch(err){
        console.log(err)
    }
    process.exit();
}
/////////delete all data from DB
const deleteData=async ()=>{
    try{
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data deleted sucessfully')
    process.exit();
    }catch(err){
     console.log(err)
    }
}
console.log(process.argv);

if(process.argv[2]==='--import'){
    importData();
}
else if(process.argv[2]==='--delete'){
    deleteData();
}