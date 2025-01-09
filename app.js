const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");

// session
const session = require("express-session");
const sessionConfig = {
  secret: "mysecretsession",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// flash
const flash = require("connect-flash");
app.use(flash());
// setting middleware for flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

// importing custom errors
const appError = require("./utlis/appError");
const wrapAsync = require("./utlis/wrapAsync");

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

app.get("/", (req, res) => {
  res.render("home");
});

const campgroundRoutes = require("./routes/campground");
app.use("/campgrounds", campgroundRoutes);

const reviewRoutes = require("./routes/review");
app.use("/campgrounds/:id/reviews", reviewRoutes);

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
