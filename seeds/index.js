const mongoose = require("mongoose");

// importing models
const Campground = require("../models/campground");
// importing modules
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");

// connecting to mongodb
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const saveDB = async () => {
  try {
    // clearing the collection
    await Campground.deleteMany({});
    // creating new documents
    for (let i = 0; i < 50; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const camp = new Campground({
        location: `${cities[random1000].city},${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae metus id est scelerisque semper vel vel risus. Nulla facilisi. Sed at velit vel felis luctus fermentum. Nulla facilisi. Sed vitae metus id est scelerisque semper vel vel risus. Nulla facilisi. Sed at velit vel felis luctus fermentum. Nulla facilisi. Sed vitae metus id est scelerisque semper vel vel`,
        price: Math.floor(Math.random() * 100) + 10,
        author: "678206b4677a747e753bb6b8",
        geometry: {
          type: "Point",
          coordinates: [-113.1331, 47.0202],
        },
        // image: `https://picsum.photos/500/300?random=${Math.random()}`
        images: [
          {
            filename: "YelpCamp/o8boxyx5pizcf91oqyrj",
            url: "https://res.cloudinary.com/dykphe12x/image/upload/v1736924742/YelpCamp/o8boxyx5pizcf91oqyrj.png",
          },
        ],
      });
      await camp.save();
    }
  } catch (e) {
    console.log("error: " + e.message);
  }
};

saveDB().then(() => {
  mongoose.connection.close();
});
