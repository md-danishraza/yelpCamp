const Campground = require("./models/campground");
const Review = require("./models/review");
// importing our validationSchemas
const validationSchemas = require("./validationSchemas");

// importing custom errors
const appError = require("./utlis/appError");
const wrapAsync = require("./utlis/wrapAsync");
module.exports.isLoggedIn = (req, res, next) => {
  // console.log(req.originalUrl);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

// order of above middlware
// isLoggidIn fn - will save the desired URL on which user want to go but need to login if not
// user(POST)route.(/login, storeReturnT0 , passport.authenticate() , callback in which we can use res.locals.returnTo)

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;

  const camp = await Campground.findById(id);
  // console.log(camp);
  if (!camp.author.equals(req.user._id)) {
    req.flash("error", "You are not authorized to do that!!");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

// middleware for validation
module.exports.validateCampground = (req, res, next) => {
  const { error } = validationSchemas.campgroundSchema.validate(req.body);
  if (error) {
    throw new appError(error.details[0].message, 400);
  } else {
    // passing to next middleware
    next();
  }
};

// middleware for validation
module.exports.validateReview = (req, res, next) => {
  const { error } = validationSchemas.reviewSchema.validate(req.body);
  if (error) {
    throw new appError(error.details[0].message, 400);
  } else {
    // passing to next middleware
    next();
  }
};

// middleware for review author
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, review_id } = req.params;
  const review = await Review.findById(review_id);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not authorized to do that!!");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};
