const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

// importing custom errors
const appError = require("../utlis/appError");
const wrapAsync = require("../utlis/wrapAsync");

// importing models
const Campground = require("../models/campground");

router.get(
  "/",

  wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
// new form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});
// post for form submission
router.post(
  "/",
  isLoggedIn,
  isAuthor,
  validateCampground,
  wrapAsync(async (req, res) => {
    const { title, price, description, location, image } = req.body;
    const newCampground = new Campground({
      title,
      price,
      description,
      location,
      image,
    });
    // taking the user id from session
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "new campground created successfully!!");
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);
// show individual camp
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    // nested populating the ref document
    const camp = await Campground.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!camp) {
      req.flash("error", "Campground not found!!");
      return res.redirect("/campgrounds");
    }
    // console.log(camp);

    res.render("campgrounds/show", { camp });
  })
);
// edit
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
      req.flash("error", "Campground not found!!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { camp });
  })
);
// handle edit put form
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, price, description, location, image } = req.body;

    await Campground.findByIdAndUpdate(
      id,
      { title, price, description, location, image },
      { new: true, runValidators: true }
    );
    req.flash("success", "successfully updated campground!!");
    res.redirect(`/campgrounds/${id}`);
  })
);
// delete
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  wrapAsync(async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
