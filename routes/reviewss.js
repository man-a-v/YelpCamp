const express = require('express');
const router = express.Router({mergeParams : true});
const wrapAsync = require('../utils/wrapAsync');
const Review = require('../models/review');
const Campground = require('../models/campgrounds');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/' , isLoggedIn,validateReview,wrapAsync(reviews.createReview ));

router.delete('/:reviewId', isLoggedIn,isReviewAuthor,wrapAsync(reviews.destroyReview));

 module.exports = router;