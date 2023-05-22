const Profile = require('../models/profile');
const express = require('express');
const profilesRouter = express.Router();

module.exports = profilesRouter

profilesRouter.post("/", async (req, res) => {
    try {
        // take authenticated user id and attach to request body
        req.body.uid = req.user.uid;
        const profile = await Profile.create(req.body);
        res.json(profile);
        console.log(profile, 'json of profile obj')
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
})

// app.post("/create", async(req, res) => {
//     try {
//         // take authenticated user id and attach to request body
//         req.body.uid = req.user.uid;
//         const profile = await Profile.create(req.body);
//         res.json(profile);
//         console.log(profile, 'json of profile obj')
//     } catch (error) {
//         //send error
//         res.status(400).json(error);
//     }
// })