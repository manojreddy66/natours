const { model } = require("mongoose");

class APIFeatures{
    constructor(query,queryString){
    //queryString that is coming from the route.
    this.query=query;
    this.queryString=queryString;
    }
    filter(){
        const queryObj={...this.queryString};
        const excludeFields=['page','sort','limit','fields'];
        excludeFields.forEach(el=> delete queryObj[el]);
        
 
         ///1badavnce filtering
        let queryStr=JSON.stringify(queryObj);
         queryStr=queryStr.replace(/\b(gte|lte|gt|lt)\b/g,match=>`$${match}`);
         console.log(JSON.parse(queryStr))
          //{ difficulty: 'easy', duration: { $gte: '5' } }
         //{ difficulty: 'easy', duration: { gte: '5' } }
         ///we should replace lte,gte,lt,gt
         this.query=this.query.find(JSON.parse(queryStr));
     //let query= Tour.find(JSON.parse(queryStr));
     return this;
    };
    sort(){
        if(this.queryString.sort){
            const sortBy=this.queryString.sort.split(',').join(' ');
            console.log(sortBy)
         this.query=this.query.sort(sortBy);
        }else{
            this.query=this.query.sort('-createdAt')
        }
        return this;
    
    };
    limitFields(){
        if(this.queryString.fields){
            const fields=this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }else{
            this.query=this.query.select('-__v');
        };
        return this;
    };
    paginate(){
        const page=this.queryString.page*1||1;
   const limit=this.queryString.limit*1||100;
   const skip=(page-1)*limit;
    this.query=this.query.skip(skip).limit(limit);
    return this;
    };
};
module.exports=APIFeatures;