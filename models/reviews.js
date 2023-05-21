const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewsSchema = Schema({
    name: String,
    image: String,
    title: String,
    uid: String
}, {
    timestamps: true
});

const Reviews = mongoose.model("Reviews", ReviewsSchema);

module.exports = Reviews;