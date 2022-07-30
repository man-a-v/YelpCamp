const express = require('express');
const router = express.Router({mergeParams : true});
const CatchAsync = require('../utils/CatchAsync');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
//const ErrorHandler = require('../utils/ErrorHandler');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/' , isLoggedIn,validateReview,CatchAsync(reviews.createReview ));

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,CatchAsync(reviews.destroyReview));

 module.exports = router;