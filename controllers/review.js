// importing models
const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const { rating, body } = req.body;

  const camp = await Campground.findById(id);
  const newReview = new Review({ body, rating });
  newReview.author = req.user._id;

  camp.reviews.push(newReview);
  await camp.save();
  await newReview.save();
  req.flash("success", "successfully added review!!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, review_id } = req.params;
  await Review.findByIdAndDelete(review_id);
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
  req.flash("success", "successfully deleted review!!");
  res.redirect(`/campgrounds/${id}`);
};
