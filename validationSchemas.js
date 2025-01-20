const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = joi.object({
  title: joi.string().required().escapeHTML(),
  price: joi.number().min(0).required(),
  description: joi.string().required().escapeHTML(),
  location: joi.string().required().escapeHTML(),

  // image: joi.array().items(
  //   joi.object({
  //     url: joi.string().required(),
  //     filename: joi.string().required(),
  //   })
  // ),
  deleteImages: joi.array(),
});

module.exports.reviewSchema = joi.object({
  rating: joi.number().min(1).max(5).required(),
  body: joi.string().required().escapeHTML(),
});
