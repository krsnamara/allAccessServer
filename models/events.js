const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true},
        eventType: { type: Array, required: true},
        image: { type: String, required: true},
        description: { type: String, required: true},
        reservation: { type: String, required: true},
        website: { type: String, required: true},
        suitability: { type: Array},
        amenities: { type: Array},
        categories: { type: Array},
        foodNightlife: { type: Array },
        attractions: { type: Array },
    },
    {timestamps: true}
);

module.exports = mongoose.model("Events", EventsSchema);