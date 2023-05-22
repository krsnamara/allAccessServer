const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    preferredName: String,
    state: String,
    city: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Profile', profileSchema);