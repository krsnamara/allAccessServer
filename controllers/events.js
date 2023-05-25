const express = require('express');
const eventsRouter = express.Router();
const isAuthenticated = require('../utils/isAuth.js');
const Events = require('../models/events.js')
//this next line of code was a suggestion but it throws and error
// const data = await Events.find();

// Seed
const seed = require('../data/eventSeed.js')
eventsRouter.get('/seed', async (req, res) => {
    try {
        await Events.deleteMany({});
        const data = await Events.create(seed);
        res.redirect('/');
    } catch (error) {
        console.log(error); // Log the error for debugging purposes
        res.status(500).json({ error: 'Failed to seed data' });
    }
});

// EVENTS INDEX ROUTE
eventsRouter.get("/", async (req, res) => {
    try {
        // send all events
            res.json(data);
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
eventsRouter.delete("/:id", async (req, res) => {
    try {
        // send all events
        res.json(await Events.findByIdAndRemove(req.params.id));
        
    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

// EVENTS UPDATE ROUTE
eventsRouter.put("/:id", async (req, res) => {
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
    
    // EVENTS SHOW ROUTE
    eventsRouter.get("/:id", async (req, res) => {
        try {
            // send all events
                res.json(await Events.findById(req.params.id));
        } catch (error) {
            // send error
            res.status(400).json(error);
        }
    });
module.exports = eventsRouter;