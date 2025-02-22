// loading env variables if app in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const engine = require("ejs-mate");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const dbUrl = process.env.DB_URL;
// const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp";

// models
const User = require("./models/user");

// routes
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");
const userRoutes = require("./routes/user");

// session
const session = require("express-session");
const MongoStore = require("connect-mongo");

const sessionSecret = process.env.SESSIONSECRET;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  // time in seconds before session is refreshed
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: sessionSecret,
  },
});
store.on("error", (err) => console.log("session store error", err));

app.set("trust proxy", 1); // Trust Render's proxy
const sessionConfig = {
  store: store,
  name: "yelp-session",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "lax", // Prevent CSRF while allowing cookies in same-site requests
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

// helmet
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/",
];
const connectSrcUrls = ["https://api.maptiler.com/"];
const fontSrcUrls = ["https://fonts.gstatic.com/"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dykphe12x/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://api.maptiler.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

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

// To remove data using these defaults:
app.use(mongoSanitize());

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
  .connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.get("/", (req, res) => {
  res.render("home");
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is running on port " + port); // logs the server has started on port 3000
});
