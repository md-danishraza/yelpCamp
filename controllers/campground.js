// importing models
const Campground = require("../models/campground");

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
  const { title, price, description, location, image } = req.body;
  const newCampground = new Campground({
    title,
    price,
    description,
    location,
    image,
  });
  // taking the user id from session
  newCampground.author = req.user._id;
  await newCampground.save();
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
  const { id } = req.params;
  const { title, price, description, location, image } = req.body;

  await Campground.findByIdAndUpdate(
    id,
    { title, price, description, location, image },
    { new: true, runValidators: true }
  );
  req.flash("success", "successfully updated campground!!");
  res.redirect(`/campgrounds/${id}`);
};

// delete
module.exports.deleteCampground = async function (req, res) {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
};
