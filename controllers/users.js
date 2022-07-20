const User = require("../models/user");

module.exports.renderRegister = (req,res) => {
    res.render('users/register');
     
  }

  module.exports.createUser = async(req,res,next) => {
    try{
    const {email,username,password} = req.body;
    const user = new User({email,username});
    const registeredUser = await User.register(user,password);
    req.login(registeredUser, err =>{
        if (err) return next(err);
        req.flash('successs', 'Welcome to Yelpcamp!');
        res.redirect('/campgrounds');
    }); //req.login se after registering we will also be logged in .
    //passport.authenticate method used below for /login route automatically calls req.login after authetication 
    //so wahan pe req.login khudse likhna nahi pada tha unlike here 
    }
    catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
     
  }

  module.exports.renderLogin = (req,res) => {
    res.render('users/login');
     
  }

  module.exports.Login = (req,res) => {
    //passport.authenticate line borhi hai ki use local stratergy for authenticantion and if falure occurs in login then flash a flash message adn refirect to the login page. 
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
   //if i driectly go for logging in then redirect user ayega
   //so im redirected to campgrounds agar kahin aur jahan login needed hai then after ogin 
   //ill be throen back to that url
   //if i direcctly go for registering then ill be logged in and redirecteed to campgrounds as per the router hanndler above 
   //yahan tak pahunche ga hi nahi
    res.redirect(redirectUrl); 
       
    }

    module.exports.Logout = (req,res)=>{
        req.logout();//passport 0.50 version mei no need to pass callbsack
            req.flash('success', 'Goodbye!');
            res.redirect('/campgrounds');
          
       //this smple methd prvdd by passport allows logging out
      
    }