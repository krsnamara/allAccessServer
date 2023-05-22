const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsSchema = Schema({
    name: { type: String, required: true },
    image: String,
    title: { type: String, required: true },
    uid: String
}, {
    timestamps: true
});

const Reviews = mongoose.model("Reviews", ReviewsSchema);

module.exports = Reviews;