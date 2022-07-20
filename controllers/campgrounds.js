const Campground = require('../models/campgrounds');

module.exports.index =  async (req,res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index',{camps});
}

module.exports.renderNewForm = (req ,res)=>{
    //agar return nahi dala then you wont escape this method the next line res.render('campgrounds/new'); execute hojeygi and will cause error.
    
     res.render('campgrounds/new');
     
}

module.exports.createCamp = async (req,res)=>{
    //its imp to use iloogedin for both the get and post route of adding a new camp because its possible someone is able to bypass the get route and get to post route directly , for eg by using psotman
    //res.send(req.body);//as you can see title and location input both are 
    //part of an obj campgrounds in the requrst body
    //this below isnt a mongoose schema this is going to validate our data before we even try to save our data using mongoose
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}))  
    campground.author = req.user._id;
    await campground.save();
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