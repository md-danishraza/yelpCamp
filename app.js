const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");

// joi for error validation
const joi = require("joi");
// importing our validationSchemas
const validationSchemas = require("./validationSchemas");

// importing custom errors
const appError = require("./utlis/appError");
const wrapAsync = require("./utlis/wrapAsync");

// importing models
const Campground = require("./models/campground");
const Review = require("./models/review");

// Set up the static directory for client-side files
app.use(express.static(path.join(__dirname, "public")));
// middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

const methodOverride = require("method-override");
// Override HTTP methods using the `_method` query parameter
app.use(methodOverride("_method"));

// Use EJS-Mate for rendering EJS files
app.engine("ejs", engine);
// setting views and ejs engine(for index files)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// connecting to mongodb
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

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

const validateReview = (req, res, next) => {
  const { error } = validationSchemas.reviewSchema.validate(req.body);
  if (error) {
    throw new appError(error.details[0].message, 400);
  } else {
    // passing to next middleware
    next();
  }
};
app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campgrounds",
  wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  })
);
// new form
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});
// post for form submission
app.post(
  "/campgrounds",
  validateCampground,
  wrapAsync(async (req, res) => {
    // const { title, price, description, location, image } = req.body;
    // if not any of the parameters
    // if (!title && !price && !description && !location && !image) {
    //   throw new appError("Invalid Campground Data", 400);
    // }
    // console.log(req.body);
    const newCampground = new Campground({
      title,
      price,
      description,
      location,
      image,
    });
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);
// show individual camp
app.get(
  "/campgrounds/:id",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("reviews");
    // console.log(camp);
    res.render("campgrounds/show", { camp });
  })
);
// edit
app.get(
  "/campgrounds/:id/edit",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit", { camp });
  })
);
// handle edit put form
app.put(
  "/campgrounds/:id",
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { title, price, description, location, image } = req.body;
    await Campground.findByIdAndUpdate(
      id,
      { title, price, description, location, image },
      { new: true, runValidators: true }
    );
    res.redirect(`/campgrounds/${id}`);
  })
);
// delete
app.delete(
  "/campgrounds/:id",
  wrapAsync(async function (req, res) {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

// review submission
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, body } = req.body;

    const camp = await Campground.findById(id);
    const newReview = new Review({ body, rating });

    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    res.redirect(`/campgrounds/${id}`);
  })
);
// deleting review
app.delete(
  "/campgrounds/:id/reviews/:review_id",
  wrapAsync(async (req, res) => {
    const { id, review_id } = req.params;
    await Review.findByIdAndDelete(review_id);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: review_id } });

    res.redirect(`/campgrounds/${id}`);
  })
);
// if no url is matched
app.all("*", (req, res, next) => {
  next(new appError("Page not found", 404));
});

// custom error handler
app.use((err, req, res, next) => {
  const { message = "something went wrong", status } = err;
  // res.send("something went wrong");
  res.status(status || 500).render("error", { message, status, err });
});
app.listen(3000, () => {
  console.log("Server is running on port 3000"); // logs the server has started on port 3000
});
