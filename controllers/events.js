const express = require("express");
const eventsRouter = express.Router();
const Events = require("../models/events.js");

// Seed
const seed = require("../data/eventSeed.js");
eventsRouter.get("/seed", async (req, res) => {
  try {
    await Events.deleteMany({});
    const data = await Events.create(seed);
    res.redirect("/");
  } catch (error) {
    console.log(error); // Log the error for debugging purposes
    res.status(500).json({ error: "Failed to seed data" });
  }
});

// console.log(`ln 18 events.js ${Events}`);

// BASIC EVENTS INDEX ROUTE
eventsRouter.get("/", async (req, res) => {
  try {
    // send all events
    // if(req.user) {
    res.json(await Events.find());
    // } else {
    //     res.json(await Events.find());
    // }
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
