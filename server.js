const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config({path:'./config.env'})
const app=require('./app');




const db=process.env.DB.replace('<password>',process.env.DATABASE_PASSWORD)
mongoose.connect(db,{useNewUrlParser:true,useCreateIndex:true,useFindAndModify:false,useUnifiedTopology:true}).then(con=>{
    //console.log(con.connections);
    console.log(process.env.NODE_ENV)
    console.log('Data Base connections sucessfull')
});



////
//console.log(process.env);
const port= 3000 || process.env.PORT;
app.listen(port,()=>{
    console.log(`app running on port ${port}...`);

});
