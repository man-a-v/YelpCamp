const express = require('express');
const router = express.Router();
const flash = require('connect-flash');
const wrapAsync = require('../utils/wrapAsync');
const User = require("../models/user");
const passport = require("passport");
const users = require('../controllers/users');

router.route('/register')
.get( users.renderRegister)
.post( wrapAsync(users.createUser));

  router.route('/login')
.get( users.renderLogin )
.post( passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}) ,users.Login);

  router.get('/logout', users.Logout);


  


 
 module.exports = router;