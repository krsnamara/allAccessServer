const mongoose = require("mongoose");

const ImagesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    eventType: { type: String, required: true },
    imageName: { type: String },
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    description: { type: String, required: true },
    reservation: { type: String, required: true },
    website: { type: String, required: true },
    suitability: { type: Array },
    amenities: { type: Array },
    categories: { type: Array },
    foodNightlife: { type: Array },
    attractions: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Images", ImagesSchema);
