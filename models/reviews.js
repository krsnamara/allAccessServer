const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewsSchema = Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    imageName: String,
    uid: String,
  },
  {
    timestamps: true,
  }
);

const Reviews = mongoose.model("Reviews", ReviewsSchema);

module.exports = Reviews;
