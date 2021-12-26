const mongoose = require('mongoose');

const mongouri ="mongodb://localhost:27017/technomainsaltlake?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
 const connecttomongo = ()=>{
     mongoose.connect(mongouri,()=>{
         console.log("connected to mongo successfully");
     })
 }
 module.exports =connecttomongo;