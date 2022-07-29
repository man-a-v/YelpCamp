const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campgrounds');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder =mbxGeocoding({accessToken: mapBoxToken});

module.exports.index =  async (req,res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index',{camps});
}

module.exports.renderNewForm = (req ,res)=>{
    //agar return nahi dala then you wont escape this method the next line res.render('campgrounds/new'); execute hojeygi and will cause error.
    
     res.render('campgrounds/new');
     
}

module.exports.createCamp = async (req,res)=>{
    const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
    }).send()//.send() is a must to add otherwise rqst to the mapbox geolocater api wont be sent
    console.log(geoData);
    //its imp to use iloogedin for both the get and post route of adding a new camp because its possible someone is able to bypass the get route and get to post route directly , for eg by using psotman
    //res.send(req.body);//as you can see title and location input both are 
    //part of an obj campgrounds in the requrst body
    //this below isnt a mongoose schema this is going to validate our data before we even try to save our data using mongoose
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}))  
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully Added New Camp!');
   
    res.redirect(`/campgrounds/${campground._id}`);
    //yeh i that is automatically added to instances of model
    //is added to it before it is saved to data base
    //thats why were able to use it here
    }

    module.exports.renderEditForm = async(req,res) =>{//us semicolon se hum req param declare karte hain
        const {id} = req.params;
        const camp = await Campground.findById(id);
        if(!camp){
           req.flash('error' , 'Cannot find requested Camp');
        return  res.redirect('/campgrounds') ;
       }
       
         res.render('campgrounds/edit',{camp});
       
        }

        module.exports.updateCamp = async (req,res) =>{
            const {id} = req.params;
            //const camp = await Campground.findById(id);
            const camp = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground}); //we know that
            const imgs = req.files.map(f=>({url: f.path, filename: f.filename}))
            camp.images.push(...imgs);//spreading/copying contents or array in .images array 
            //not  
            await camp.save();

            if (req.body.deleteImages) {
                for (let filename of req.body.deleteImages) {
                    await cloudinary.uploader.destroy(filename);//destroy mtehod on cloudinary.uploader obj . This is a async one
                }
                await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
            }

            req.flash('success' , 'Camp updated successfully');
            res.redirect(`/campgrounds/${camp._id}`); //spreading dekhle                                                //findbyandupdate --updated objectd return karta hai as resolved value of promise(purana by default)
         
         }

         module.exports.destroyCamp = async (req,res) =>{
            const {id} =req.params;
           
            const camp = await Campground.findById(id);
           
          //fuckigng with db operations ke liye always await use karoo
           await Campground.findByIdAndDelete(id);
           req.flash('success', 'Camp Successfully deleted');
            res.redirect('/campgrounds');
        }

        module.exports.showCamp = async (req,res) =>{
            const camp = await Campground.findById(req.params.id).populate( {
                path: 'reviews',
            populate: {
                path:'author'
            }}).populate('author');
         
            if(!camp){
               req.flash('error' , 'Cannot find requested Camp');
            return  res.redirect('/campgrounds') ;
           }
            res.render('campgrounds/show',{camp})
         }