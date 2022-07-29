const { string } = require('joi');
const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});
const opts = {toJSON: {virtuals: true}};
const CampgroundSchema = new Schema({
    title: String,
    images:[ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    /*image: String,*/
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews :[{
        type: Schema.Types.ObjectId , ref: 'Review'
    }]
},opts);

//this info just has to be passed as such
//this is how mapbox like the dataset it gets(in this case campground objects)
//to ber structurewd
//CAmgrounds(collection of em all not taking abouot just one) has a faetures kay that i an array 
//each obj(campground) on that has the geometry key with coordinates and shit and the 
//properties key on it with some shit you want to work with in mapbox eg some thing for a popup as in this case

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`  
});



CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campgrounds', CampgroundSchema)