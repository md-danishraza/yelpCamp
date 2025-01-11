const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, storeReturnTo } = require("../middleware");

// importing our validationSchemas
const validationSchemas = require("../validationSchemas");

// importing custom errors
const appError = require("../utlis/appError");
const wrapAsync = require("../utlis/wrapAsync");

// importing models
const Campground = require("../models/campground");
const Review = require("../models/review");

// middleware for validation
const validateReview = (req, res, next) => {
  const { error } = validationSchemas.reviewSchema.validate(req.body);
  if (error) {
    throw new appError(error.details[0].message, 400);
  } else {
    // passing to next middleware
    next();
  }
};

// review submission
router.post(
  "/",

  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, body } = req.body;

    const camp = await Campground.findById(id);
    const newReview = new Review({ body, rating });

    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash("success", "successfully added review!!");
    res.redirect(`/campgrounds/${id}`);
  })
);
// deleting review
router.delete(
  "/:review_id",
  wrapAsync(async (req, res) => {
    const { id, review_id } = req.params;
    await Review.findByIdAndDelete(review_id);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
    req.flash("success", "successfully deleted review!!");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
