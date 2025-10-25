const Listing=require('../models/listing.js');
const Review=require('../models/review.js');

module.exports.createReview=async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    const review = new Review(req.body.review);
    review.author = req.user._id;
    await review.save();

    listing.reviews.push(review._id); 
    await listing.save();
    req.flash("success","New Review created");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview=async (req, res) => {
        let { id, reviewId } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review Deleted");
        res.redirect(`/listings/${id}`);
    };