const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// importing review controller
const review = require("../controllers/review");

// importing custom errors
const appError = require("../utlis/appError");
const wrapAsync = require("../utlis/wrapAsync");

// importing models
const Campground = require("../models/campground");
const Review = require("../models/review");

// review submission
router.post("/", isLoggedIn, validateReview, wrapAsync(review.createReview));
// deleting review
router.delete(
  "/:review_id",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(review.deleteReview)
);

module.exports = router;
