const Listing = require("./models/listing");
const ExpressError=require('./utils/ExpressError.js');
const {listingSchema,reviewSchema}=require('./schema.js');
const Review = require("./models/review.js");

const { geocode } = require('./utils/geocode');

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
    req.session.redirectUrl=req.originalUrl;
    req.flash("error","You must be logged in to create a new listing");
    return res.redirect("/login");
  }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
  };


  module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
   // console.log(listing.owner, res.locals.currentUser._id);
    if (!listing.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

  module.exports.isReviewAuthor = async (req, res, next) => {
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
   // console.log(listing.owner, res.locals.currentUser._id);
    if (!review.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
   throw new ExpressError(errMsg, 400);

    } else {
    next();
    }
    };


module.exports.validateReview = (req, res, next) => {
        let { error } = reviewSchema.validate(req.body);
        if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(errMsg,400);
        } else {
        next();
        }
        };




// Middleware to add geometry before saving (for POST/PUT)
module.exports.addGeometryFromBody=async (req, res, next) =>{
  try {
    const l = req.body?.listing;
    if (!l) return next();

    const query = [l.location, l.country].filter(Boolean).join(', ');
    if (!query) return next();

    const coords = await geocode(query);
    if (coords) {
      req.body.listing.geometry = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat],
      };
    }
    next();
  } catch (err) {
    console.error('Error in addGeometryFromBody:', err);
    next();
  }
}

// Middleware to ensure a listing has geometry (used in GET /:id)
module.exports.ensureGeometry=async (req, res, next) =>{
  try {
    const listing = await Listing.findById(req.params.id).select('location country geometry');
    if (!listing) return next();

    const hasCoords =
      listing.geometry &&
      Array.isArray(listing.geometry.coordinates) &&
      listing.geometry.coordinates.length === 2;

    if (!hasCoords) {
      const query = [listing.location, listing.country].filter(Boolean).join(', ');
      if (query) {
        const coords = await geocode(query);
        if (coords) {
          listing.geometry = { type: 'Point', coordinates: [coords.lng, coords.lat] };
          await listing.save();
        }
      }
    }

    // Expose coords to the view
    if (
      listing.geometry &&
      Array.isArray(listing.geometry.coordinates) &&
      listing.geometry.coordinates.length === 2
    ) {
      res.locals.coords = {
        lng: listing.geometry.coordinates[0],
        lat: listing.geometry.coordinates[1],
      };
    }

    next();
  } catch (err) {
    console.error('Error in ensureGeometry:', err);
    next(err);
  }
}
