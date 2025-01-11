const express = require("express");
const User = require("../models/user");
const wrapAsync = require("../utlis/wrapAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  wrapAsync(async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({
        username,
        email,
      });
      // static register method on User shchema provided by passport-local-mongoose
      // take instance of User and password (perform hashing and saves to db)
      const registeredUser = await User.register(user, password);
      // saving login information in session
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to YelpCamp!");
        res.redirect("/campgrounds");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  // use the storeReturnTo middleware to save the returnTo URL from session to res.locals
  storeReturnTo,
  // passport.authenticate logs the user in and clears req.session
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  // Now we can use res.locals.returnTo to redirect the user after login
  async (req, res) => {
    req.flash("success", "welcome back");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
