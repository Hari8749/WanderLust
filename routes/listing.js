// routes/listings.js
const express = require('express');
const router = express.Router();
const asyncWrap = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController = require('../controllers/listing.js');
const { addGeometryFromBody, ensureGeometry } = require('../middleware.js');

//const MAP_KEY=process.env.MAP_KEY;
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

// Expose MapTiler key globally in views
router.use((req, res, next) => {
  res.locals.MAP_KEY = process.env.MAP_KEY || '';
  next();
});


// Routes
router
  .route('/')
  .get(asyncWrap(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    asyncWrap(addGeometryFromBody),
    asyncWrap(listingController.createListing)
  );

router.get('/new', isLoggedIn, listingController.renderNewForm);

router
  .route('/:id')
  .get(asyncWrap(ensureGeometry), asyncWrap(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    asyncWrap(addGeometryFromBody),
    asyncWrap(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, asyncWrap(listingController.destroyListing));

router.get('/:id/edit', isLoggedIn, isOwner, asyncWrap(listingController.renderEditForm));

module.exports = router;




















// // const express=require('express');
// const router=express.Router();
// const asyncWrap=require('../utils/wrapAsync.js');
// //const ExpressError=require('../utils/ExpressError.js');
// const Listing=require('../models/listing.js');
// // const {listingSchema}=require('../schema.js');
// const { isLoggedIn, isOwner,validateListing } = require('../middleware.js');
// const listingController=new require('../controllers/listing.js');

// const multer  = require('multer');
// const { storage } = require('../cloudConfig.js');
// const upload = multer({storage});

// router.route('/')
//       .get(asyncWrap(listingController.index))
//       .post(isLoggedIn,upload.single('listing[image]'),validateListing,asyncWrap(listingController.createListing));
// //       .post(upload.single('listing[image]'), (req, res, next)=> {
// //          res.send(req.file);
// // });

// router.get("/new",isLoggedIn,listingController.renderNewForm);


// router.route('/:id')
//       .get(asyncWrap(listingController.showListing))
//       .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,asyncWrap(listingController.updateListing))
//       .delete(isLoggedIn,isOwner,asyncWrap(listingController.destroyListing));



// router.get("/:id/edit",isLoggedIn,isOwner,asyncWrap(listingController.renderEditForm));


// module.exports=router;