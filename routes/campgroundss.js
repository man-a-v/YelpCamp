const express = require('express');
const router = express.Router();
const CatchAsync = require('../utils/CatchAsync');
//const ExpressError = require('../utils/ErrorHandler');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const {isLoggedIn, isAuthor,validateCampground,validateReview} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const {storage} = require('../cloudinary');
var upload = multer({storage});


router.get('/makecampground', CatchAsync(async (req,res) => {
    const camp = new Campground({title: 'Backyard'});
    await camp.save();
     res.send(camp);
 }))
 
 
 router.route('/')
 .get( CatchAsync(campgrounds.index))
 .post(isLoggedIn,upload.array('image'), validateCampground, CatchAsync(campgrounds.createCamp));

 //,upload.array('image') has to go berfore validate because it wroks on the request body data (storing stuff labbeled as images into cloudinry)
 //only then this will be accessible to vaildate
 //for now validate should be after upload.array(vid 536)
 //to fuck with db takes time so we gotta use
 //async and await
 router.get('/new', isLoggedIn, campgrounds.renderNewForm );
 //new rqst kko id ke upar rakho cause otherwise 
 //new was getting treated as id string 
 //see the compiler mathches reqst as per url 
 //in the order they've been mentioned
 //we dont hae anythign with id as new
 //so we shoudl keep it above /:id route
 //so it can override it

 router.route('/:id')
 .get(CatchAsync(campgrounds.showCamp))
 .put(isAuthor,upload.array('image'),validateCampground,CatchAsync( campgrounds.updateCamp))
 //requirign overrride and enabling method overrride
 //with app.use(methodoverride()) line I can 
 //use data sent by from for put rqst
 .delete(isAuthor,CatchAsync(campgrounds.destroyCamp ));
 
 
  router.get('/:id/edit',isLoggedIn,isAuthor,CatchAsync(campgrounds.renderEditForm ))
 
 module.exports = router;