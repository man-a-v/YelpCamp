if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//mongodb+srv://user1:<password>@cluster0.dlfch.mongodb.net/?retryWrites=true&w=majority
//process.env.NODE_ENV this env var takes value of "development"
//when app is in devlpmnt and production when app is destroyed
//above code simple says that when were in devlpmnt mode
// add the vars in .env file to process.env so they can be accesssed
//by default we run in development mode
const express = require('express');

const  path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const methodOverride = require('method-override');

const Campground = require('./models/campgrounds');
const ExpressError = require('./utils/ExpressError');
const { join } = require('path');
const Review = require('./models/review');
const campgroundss = require('./routes/campgroundss');
const reviewss = require('./routes/reviewss');
const  session = require('express-session');  
const flash = require('connect-flash');
const passport = require("passport");
 const LocalStrategy = require("passport-local");
  const User = require("./models/user");
  const userRoutes = require('./routes/users');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const  dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require("connect-mongo")(session);
//'mongodb://localhost:27017/yelp-camp'
  mongoose.connect(dbUrl);
//i changed    to   0.0.0.0:27017 and the ECONNREFUSED to conect TCP error went away .
//but then other functionality broke so readded localhost and it works now 
//perhaps I'll have to do this again so thats why im wirting this
//also im shifting this line of code below all this const mumbo jumbo
//catch(error => console.error(error));
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
   console.log("Database connected");
});
const app = express();

app.engine('ejs', ejsMate);//we're changing the default engine relied on by express for fucking with ejs
app.set('view engine' , 'ejs');
app.set('views', path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}));
//to be able to use the request body i.e 
//completely parse it we need to use this line above
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize()); //prevents mongo injection

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //units here are seconds
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'vnaf',//this will be the name of cookie sent by session. itll thus become harder for hacker to look for session sent cookie cux it aint the standard connect.sid anymore 
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,//cookies sent by session are accesible only through http not JS
       //secure: true,
        expires: Date.now() + 1000*60*60*24*7,//expiration rakhni hoti hai ,(//units are miliseconds)
        // imagine you sign in then if the info is stored in the session permanentely you're alway slogged in and anybodsy can come in and use it then
        maxAge: 1000*60*60*24*7//same thing as above just to illustrate ye dala 
    }  
}
app.use(session(sessionConfig));

app.use(flash()); 


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duevon5bj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/duevon5bj/" ],
            childSrc   : [ "blob:" ]
        }
    })
);



/*app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy:false,
      crossOriginOpenerPolicy: false
    })
  );*/ //shift+f5 full reload of page not just reload this helpd fix the mess of hellmet
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.user = req.user;//this can only be accessed after the serilaizeuser and deserializeuser actions have been performed so whrite it after those lines
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


/*const validateCampground = (req,res,next)=>{
  const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el=>el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next(); //must do so if we wanna make it to the route handlerin which this middleware is called
    }
   
}

const validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
      if(error){
          const msg = error.details.map(el=>el.message).join(',')
          throw new ExpressError(msg,400)
      } else{
          next(); //must do so if we wanna make it to the route handler in which this middleware is called
      }
     
  }*/




 

app.use('/',userRoutes);
app.use('/campgrounds',campgroundss);
app.use('/campgrounds/:id/reviews' , reviewss);
app.get('/', (req,res) => {
    res.render('home')
})

/*
app.get('/campgrounds/makecampground', wrapAsync(async (req,res) => {
    const camp = new Campground({title: 'Backyard'});
    await camp.save();
     res.send(camp);
 }))
 
 
 app.get('/campgrounds' , wrapAsync(async (req,res) => {
     const camps = await Campground.find({});
     res.render('campgrounds/index',{camps});
 }))
 //to fuck with db takes time so we gotta use
 //async and await
 app.get('/campgrounds/new', (req ,res)=>{
     res.render('campgrounds/new');
     })
 //new rqst kko id ke upar rakho cause otherwise 
 //new was getting treated as id string 
 //see the compiler mathches reqst as per url 
 //in the order they've been mentioned
 //we dont hae anythign with id as new
 //so we shoudl keep it above /:id route
 //so it can override it
 app.get('/campgrounds/:id',wrapAsync(async (req,res) =>{
    const camp = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show',{camp});
 }))
 
 app.post('/campgrounds', validateCampground, wrapAsync(async (req,res)=>{
 //res.send(req.body);//as you can see title and location input both are 
 //part of an obj campgrounds in the requrst body
 //this below isnt a mongoose schema this is going to validate our data before we even try to save our data using mongoose
 
 const campground = new Campground(req.body.campground);
 await campground.save();
 res.redirect(`/campgrounds/${campground._id}`);
 //yeh i that is automatically added to instances of model
 //is added to it before it is saved to data base
 //thats why were able to use it here
 }))
 
 app.get('/campgrounds/:id/edit',wrapAsync( async(req,res) =>{//us semicolon se hum req param declare karte hain
     //this get requrst gets us the form for editing camp
 const camp = await Campground.findById(req.params.id);
 res.render('campgrounds/edit',{camp});
 }))
 
 //requirign overrride and enabling method overrride
 //with app.use(methodoverride()) line I can 
 //use data sent by from for put rqst
 app.put('/:id',validateCampground,wrapAsync( async (req,res) =>{
    const camp = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground}); //we know that
    res.redirect(`/campgrounds/${camp._id}`); //spreading dekhle                                                //findbyandupdate --updated objectd return karta hai as resolved value of promise(purana by default)
 
 }))
 
 app.delete('/campgrounds/:id',wrapAsync( async (req,res) =>{
     const {id} =req.params;
   //fuckigng with db operations ke liye always await use karoo
    await Campground.findByIdAndDelete(id);
     res.redirect('/campgrounds');
 }))




app.post('/campgrounds/:id/reviews' , validateReview,wrapAsync( async(req,res)=>{
   const campground =  await Campground.findById(req.params.id);
   const review = new Review(req.body.review);
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   res.redirect(`/campgrounds/${campground._id}`);
}))*/



/*app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    // res.send("DELETE ME!")
}))*/

app.all('*',(req,res,next)=>{//this is a routte handler app.use is not a route handler middleware its a different middleware entirely. 
    //so when you want something done when none of the routes are matched this can eb used not app.use that will execute itself or try to on every request 
    next(new ExpressError('Page not found', 404))
    //this next is passing this error to the next error handler ehich here is the app.use below
})

app.use((err,req,res,next)=>{
    const {status = 404} =err;
    if(!err.message) err.message = 'ERROR!';
    res.status(status).render('error',{err});
    
})
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Serving on port ${port}`);
})