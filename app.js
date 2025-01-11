const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const passport = require("passport");
const localStrategy = require("passport-local");

// models
const User = require("./models/user");

// routes
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

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

// initializing passport
app.use(passport.initialize());
// for persistence login (after session middleware)
app.use(passport.session());
// using localstrategy
passport.use(new localStrategy(User.authenticate()));

// how to store it in session
passport.serializeUser(User.serializeUser());
// how to unstore it in session
passport.deserializeUser(User.deserializeUser());

// flash
const flash = require("connect-flash");
app.use(flash());
// setting middleware for flash
app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.currentUser = req.user; // current logged in user
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

app.get("/fakeUser", async (req, res) => {
  const user = new User({
    email: "fakeuser@gmail.com",
    username: "FakeUser",
  });
  const newUser = await User.register(user, "fakepassword");
  res.send(newUser);
});

app.use("/", userRoutes);

app.use("/campgrounds", campgroundRoutes);

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
