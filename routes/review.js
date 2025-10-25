const express=require('express');
const router=express.Router({mergeParams:true});
const asyncWrap=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js');
const Listing=require('../models/listing.js');
const Review=require('../models/review.js');
const {validateReview, isReviewAuthor } = require('../middleware.js');
const { isLoggedIn } = require('../middleware.js');

const reviewController=require('../controllers/reviews.js');

router.post("/",isLoggedIn,validateReview, asyncWrap(reviewController.createReview));

router.delete( "/:reviewId",isLoggedIn,isReviewAuthor,asyncWrap(reviewController.destroyReview));

module.exports=router;