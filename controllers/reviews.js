const Campground = require('../models/campgrounds');
const Review = require('../models/review');


module.exports.createReview = async(req,res)=>{
    const campground =  await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New review Successfully created');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.destroyReview = async (req,res) =>{
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}); //$pull is a mongo operator taht allows us to delete all instances of speciefied value (int this case reviewId )from the specified array(here reviews)
   //we did not use findByIdANdDElete aboev to delete the reference because that does not delete the reference it only makes the reference point to nothing so the reference still exists obvoisly this isnt teh case below because here we are deleting objects not referneces so we ued findbyidanddelete
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Successfully deleted');
    res.redirect(`/campgrounds/${id}`);
   //res.send("hello");
 }