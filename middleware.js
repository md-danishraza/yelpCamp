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
