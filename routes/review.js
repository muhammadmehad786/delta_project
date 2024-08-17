const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const Review = require('../models/review.js');
const Listing = require("../models/listing.js");
const {validateReviews, isloggedin, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


 

               // Create Review Route
router.post('/', isloggedin, validateReviews, wrapAsync(reviewController.createReview));


            //  Delete review route
router.delete('/:reviewId', isloggedin, isReviewAuthor, wrapAsync(reviewController.deleteReview));


module.exports = router;