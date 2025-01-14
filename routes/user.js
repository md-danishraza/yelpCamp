const express = require("express");
const User = require("../models/user");
const wrapAsync = require("../utlis/wrapAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

const router = express.Router({ mergeParams: true });
// user controller
const user = require("../controllers/user");

router
  .route("/register")
  .get(user.renderRegister)
  .post(wrapAsync(user.register));

router
  .route("/login")
  .get(user.loginForm)
  .post(
    // use the storeReturnTo middleware to save the returnTo URL from session to res.locals
    storeReturnTo,
    // passport.authenticate logs the user in and clears req.session
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    // Now we can use res.locals.returnTo to redirect the user after login
    wrapAsync(user.login)
  );

router.get("/logout", user.logout);

module.exports = router;
