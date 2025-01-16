// importing models
const Campground = require("../models/campground");
// cloudinary
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

// new form
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

// post for form submission
module.exports.createCampground = async (req, res) => {
  const { title, price, description, location } = req.body;
  const newCampground = new Campground({
    title,
    price,
    description,
    location,
  });
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // taking the user id from session
  newCampground.author = req.user._id;
  await newCampground.save();
  // console.log(newCampground);
  req.flash("success", "new campground created successfully!!");
  res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  // nested populating the ref document
  const camp = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!camp) {
    req.flash("error", "Campground not found!!");
    return res.redirect("/campgrounds");
  }
  // console.log(camp);

  res.render("campgrounds/show", { camp });
};

// edit
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Campground not found!!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};

// update
module.exports.updateCampground = async (req, res) => {
  // console.log(req.body);
  const { id } = req.params;
  const { title, price, description, location } = req.body;

  const camp = await Campground.findByIdAndUpdate(
    id,
    { title, price, description, location },
    { new: true, runValidators: true }
  );

  const images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // pushing the each image object to images field
  camp.images.push(...images);
  await camp.save();

  if (req.body.deleteImages) {
    // deleting images from cloudinary
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    // deleting images from mongo
    await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  req.flash("success", "successfully updated campground!!");
  res.redirect(`/campgrounds/${id}`);
};

// delete
module.exports.deleteCampground = async function (req, res) {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
};
