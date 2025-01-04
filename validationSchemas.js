const joi = require("joi");

module.exports.campgroundSchema = joi.object({
  title: joi.string().required(),
  price: joi.number().min(0).required(),
  description: joi.string().required(),
  location: joi.string().required(),
  image: joi.string().required(),
});

module.exports.reviewSchema = joi.object({
  rating: joi.number().min(1).max(5).required(),
  body: joi.string().required(),
});
