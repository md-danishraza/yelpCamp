const mongoose = require("mongoose");
const Review = require("./review");
const appError = require("../utlis/appError");
const { string } = require("joi");
// shortcut for schema
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
  title: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  images: [imageSchema],
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

CampgroundSchema.pre("save", function (next) {
  if (this.images.length > 5) {
    const err = new appError(
      "Maximum number of images exceeded. Only 5 images are allowed.",
      400
    );
    next(err);
  } else {
    next();
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
