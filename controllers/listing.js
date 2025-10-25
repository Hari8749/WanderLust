const Listing = require('../models/listing.js');
module.exports.index=async (req, res) => {
  const { q } = req.query; // 'q' comes from search form
  let listings;

  if (q) {
    const regex = new RegExp(q, "i"); // case-insensitive search
    listings = await Listing.find({ title: regex });
  } else {
    listings = await Listing.find({});
  }

  res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req, res) => {
        let { id } = req.params;
       const listing= await Listing.findById(id).populate({path:'reviews',populate:{path:"author"}}).populate('owner');
      // console.log(listing);
      if(!listing){
        req.flash("error","Listing not found");
        res.redirect("/listings");
      }
      else{
         res.render('listings/show.ejs',{listing});
      }
       
};

module.exports.createListing=async(req,res,next)=>{
   if(!req.body.listing){
        throw new ExpressError("Invalid Listing Data",400);
   }
   
   let url=req.file.path;
   let filename=req.file.filename;
   

    let listingData=req.body.listing;
    let newListing=new Listing(listingData);
    newListing.image={url,filename};

    newListing.owner=req.user._id;
    await newListing.save();
    req.flash("success","New listing created");
    res.redirect(`/listings`);
   
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id);
     if(!listing){
        req.flash("error","Listing not found");
        res.redirect("/listings");
      }
      else{
        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
      }
};

module.exports.updateListing=async(req,res)=>{
    
    let {id}=req.params;
    let listingData=req.body.listing;
    let listing=await Listing.findByIdAndUpdate(id,listingData);
    
    if(typeof req.file !== "undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }

    req.flash("success"," listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    //console.log("Deleted listing:",deletedListing);
    req.flash("success","listing Deleted");
    res.redirect("/listings");
};