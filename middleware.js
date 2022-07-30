const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ErrorHandler = require('./utils/errorhandler');
const Campground = require('./models/campgrounds');
const Review= require('./models/review');
module.exports.isLoggedIn = (req,res,next)=>{
    const Campground = require('./models/campgrounds'); 
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
    req.flash('error', 'you must be signed in!!');
   return res.redirect('/login'); //agar return nahi dala then you wont escape this method the next line res.render('campgrounds/new'); execute hojeygi and will cause error.
 }
next();
}


module.exports.validateReview = (req,res,next)=>{
    const {error} = reviewSchema.validate(req.body);
      if(error){
          const msg = error.details.map(el=>el.message).join(',')
          throw new ErrorHandler(msg,400)
      } else{
          next(); //must do so if we wanna make it to the route handler in which this middleware is called
      }
     
  }

module.exports.validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
      if(error){
          const msg = error.details.map(el=>el.message).join(',')
          throw new ErrorHandler(msg,400)
      } else{
          next(); //must do so if we wanna make it to the route handlerin which this middleware is called
      }
     
  }

  module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
     return res.redirect(`/campgrounds/${id}`);
    }
    next();
  }

  module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
     return res.redirect(`/campgrounds/${id}`);
    }
    next();
  }



