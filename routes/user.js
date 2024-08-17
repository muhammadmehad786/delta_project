const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectURL} = require("../middleware.js");
const userController = require("../controllers/users.js");


             // show signup route, create signup route for user registered
router.route("/signup").get(userController.renderSignupForm).post(wrapAsync(userController.signup));
   
             // show login route, create login route
router.route("/login").get(userController.renderLoginForm).post(saveRedirectURL, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.login);

           // create logout route
router.get("/logout", userController.logout);


module.exports = router;