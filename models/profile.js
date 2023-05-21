const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    preferredName: String,
    state: String,
    city: String
})

module.exports = mongoose.model('Profile', profileSchema);