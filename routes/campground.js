const express = require("express");
const router = express.Router({ mergeParams: true });

// importing our validationSchemas
const validationSchemas = require("../validationSchemas");

// importing custom errors
const appError = require("../utlis/appError");
const wrapAsync = require("../utlis/wrapAsync");

// importing models
const Campground = require("../models/campground");

// middleware for validation
const validateCampground = (req, res, next) => {
  const { error } = validationSchemas.campgroundSchema.validate(req.body);
  if (error) {
    throw new appError(error.details[0].message, 400);
  } else {
    // passing to next middleware
    next();
  }
};

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
// new form
router.get("/new", (req, res) => {
  res.render("campgrounds/new");
});
// post for form submission
router.post(
  "/",
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
    const camp = await Campground.findById(id).populate("reviews");
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
  wrapAsync(async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

module.exports = router;
