const express = require('express');
const eventsRouter = express.Router();
const isAuthenticated = require('../utils/isAuth.js');
const Events = require('../models/events.js')

// Seed
const seed = require('../data/eventSeed.js');
eventsRouter.get('/seed', (req, res) => {
    Events.deleteMany({}, (error, allevents) => {});

    Events.create(seed, (error, data) => {
        res.redirect('/events');
    });
});

// EVENTS INDEX ROUTE
eventsRouter.get("/", async (req, res) => {
    try {
        // send all events
            res.json(await Events.find());
    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

// EVENTS CREATE ROUTE
eventsRouter.post("/", async (req, res) => {
    try {
        // take authenticated user id and attach to request body
        req.body.uid = req.user.uid;
        // send all events
        const reviews = await Events.create(req.body);

        res.json(reviews);
    } catch (error) {
        //send error
        res.status(400).json(error);
    }
});

// EVENTS DELETE ROUTE
eventsRouter.delete("/:id", isAuthenticated, async (req, res) => {
    try {
        // send all events
        res.json(await Events.findByIdAndRemove(req.params.id));

    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

// EVENTS UPDATE ROUTE
eventsRouter.put("/:id", isAuthenticated, async (req, res) => {
    try {
        req.body.uid = req.user.uid;
        //send all events
        res.json(
            await Events.findByIdAndUpdate(req.params.id, req.body, { new: true})
        );
    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

module.exports = eventsRouter;