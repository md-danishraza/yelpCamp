const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const { storage } = require("../cloudinary");

// multer
const multer = require("multer");
const upload = multer({ storage });

// campgrounds controller
const campground = require("../controllers/campground");

// importing custom errors
const appError = require("../utlis/appError");
const wrapAsync = require("../utlis/wrapAsync");

// importing models
const Campground = require("../models/campground");

// new form
router.get("/new", isLoggedIn, campground.renderNewForm);
// homepage
router
  .route("/")
  .get(wrapAsync(campground.index))
  // post for form submission
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    wrapAsync(campground.createCampground)
  );

// edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(campground.renderEditForm)
);
// handle edit put form and delete form
router
  .route("/:id")
  // show individual camp
  .get(wrapAsync(campground.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    wrapAsync(campground.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, wrapAsync(campground.deleteCampground));

module.exports = router;
