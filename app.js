if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ExpressError = require('./utils/ExpressError.js');

const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const User = require('./models/user.js');
const { listingSchema, reviewSchema } = require('./schema.js');

// Routers
const listingRouter = require('./routes/listing.js');
const reviewRouter = require('./routes/review.js');
const userRouter = require('./routes/user.js');

// MongoDB Connection
//const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

const dbUrl = process.env.ATLASDB_URL;

async function main() {
    await mongoose.connect(dbUrl);
}
main()
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB connection failed", err));

// EJS Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET
    },
    touchAfter: 24 * 3600 // time period in seconds
});
store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

// Sessions & Flash
const sessionOptions = {
    store: store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionOptions));
app.use(flash());

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Globals
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    res.locals.MAPTILER_KEY = process.env.MAP_KEY; // ✅ Pass MAP_KEY to all EJS files
    next();
});

// Routes
// app.get('/', (req, res) => {
//     res.send("Hello World");
// });

app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

// 404 Handler
app.all(/.*/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Error Handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Something went wrong!";
    res.status(statusCode).render("listings/error.ejs", { err });
});

// Server Start
app.listen(8080, () => {
    console.log("Server started at http://localhost:8080");
});
















// if(process.env.NODE_ENV!=='production'){
//     require('dotenv').config();
// }


// const express=require('express');
// const app=express();
// const mongoose=require('mongoose');
// const Listing=require('./models/listing.js');
// const path=require('path');
// const { url } = require('inspector');
// const methodOverride=require('method-override');
// const ejsMate=require('ejs-mate');
// const asyncWrap=require('./utils/wrapAsync.js');
// const ExpressError=require('./utils/ExpressError.js');
// const { error } = require('console');
// const {listingSchema,reviewSchema}=require('./schema.js');
// const Review = require('./models/review.js');
// const session=require('express-session');
// const flash=require('connect-flash');

// const passport=require('passport');
// const LocalStrategy=require('passport-local');
// const User=require('./models/user.js');

// const listingRouter=require('./routes/listing.js');
// const reviewRouter=require('./routes/review.js');
// const userRouter=require('./routes/user.js');



// const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
// async function main(){
//    await mongoose.connect(MONGO_URL);
// }
//     main()
//     .then(()=>{
//         console.log("MongoDB connected");
//     })
//     .catch((err)=>{
//         console.log("MongoDB connection failed",err);
//     });

//     app.engine('ejs',ejsMate);
//     app.set('view engine','ejs');
//     app.set('views',path.join(__dirname,'views'));
//     app.use(express.urlencoded({extended:true}));
//     app.use(methodOverride('_method'));
  
//     app.use(express.static(path.join(__dirname,'public')));

//     const sessionOptions={
//         secret:'mysecret',
//         resave:false,
//         saveUninitialized:true,
//         cookie:{
//             httpOnly:true,
//             expires:Date.now()+1000*60*60*24*7,
//             maxAge:1000*60*60*24*7
//         }
//     }
//     app.use(session(sessionOptions));
//     app.use(flash());

//     app.use(passport.initialize());
//     app.use(passport.session());
//     passport.use(new LocalStrategy(User.authenticate()));
//     passport.serializeUser(User.serializeUser());
//     passport.deserializeUser(User.deserializeUser());

//     app.get('/',(req,res)=>{
//     res.send("Hello World");
// });
   
//     app.use((req,res,next)=>{
//         res.locals.success=req.flash('success');
//         res.locals.error=req.flash('error');
//         res.locals.currentUser=req.user;
//         next();
//     });

//     app.use('/listings',listingRouter);
//     app.use('/listings/:id/reviews',reviewRouter);
//     app.use('/',userRouter);

// // app.get('/testlisting',asyncWrap(async(req,res)=>{
// //     let sampleListing=new Listing({
// //         title:"Beautiful Beach House",
// //         description:"A lovely beach house with stunning ocean views.",
// //         price:1200,
// //         location:"Malibu",
// //         country:"USA"
// //     });
// //     await sampleListing.save();
// //     console.log("Listing saved:",sampleListing);
// //     res.send("Listing created");

// // }));

// app.all(/.*/, (req, res, next) => {
//     next(new ExpressError("Page Not Found", 404));
// });

// app.use((err, req, res, next) => {
//   const { statusCode = 500 } = err;
//   if (!err.message) err.message = "Something went wrong!";
//   res.status(statusCode).render("listings/error.ejs", { err });
// });

// app.listen(8080,()=>{
//     console.log("server started at port 8080");
// });