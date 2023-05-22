const express = require('express');
const profilesCtrl = require('../controllers/profiles');

const profilesRouter = express.Router();

// POST /profiles (create a profile -after sign up)
profilesRouter.post('/', profilesCtrl.create);

module.exports = profilesRouter; 