const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const Review = require('./review.js');

const listingSchema=new Schema({
    title:
    {
        type:String,
        required:true
    },
    description:String,
   image: {
  filename: {
    type: String,
    default: "listingimage"
  },
  url: {
    type: String,
    default: "https://unsplash.com/photos/an-aerial-view-of-a-beach-with-palm-trees-jpfLtHmQFek"
  }
}
,
    price:Number,
    location:String,
    country:String,

        geometry: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    
    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:'Review'
      }
    ],
    
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }


});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing=mongoose.model('Listing',listingSchema);

module.exports=Listing;
