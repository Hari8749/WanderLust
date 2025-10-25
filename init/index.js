const mongoose=require('mongoose');
const initData=require('./data.js');
const Listing=require('../models/listing.js');

const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';

async function main(){
   await mongoose.connect(MONGO_URL);
}

    main()
    .then(()=>{
        console.log("MongoDB connected");
    })
    .catch((err)=>{
        console.log("MongoDB connection failed",err);
    });

const initDB=async()=>{
        await Listing.deleteMany({});
        initData.data=initData.data.map((obj)=>({
            ...obj,
            owner:'68f869b7cd5c0dad971cccb2'}));
        await Listing.insertMany(initData.data);
        console.log("Database initialized with sample data");
    }
initDB();