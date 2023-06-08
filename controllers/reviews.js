const express = require("express");
const reviewsRouter = express.Router();
const Reviews = require("../models/reviews.js");

// Routes //

// Seed
const seed = require("../data/reviewSeed.js");
reviewsRouter.get("/seed", async (req, res) => {
  try {
    await Reviews.deleteMany({});
    const data = await Reviews.create(seed);
    res.redirect("/");
  } catch (error) {
    console.log(error); // Log the error for debugging purposes
    res.status(500).json({ error: "Failed to seed data" });
  }
});

// REVIEWS INDEX ROUTE
reviewsRouter.get("/", async (req, res) => {
  try {
    // send all reviews
    // if(req.user) {
    res.json(await Reviews.find());
    // } else {
    //     res.json(await Reviews.find());
    // }
  } catch (error) {
    // send error
    res.status(400).json(error);
  }
});

// REVIEWS CREATE ROUTE
reviewsRouter.post("/", async (req, res) => {
  try {
    // take authenticated user id and attach to request body
    req.body.uid = req.user.uid;
    // send all reviews
    const reviews = await Reviews.create(req.body);

    res.json(reviews);
  } catch (error) {
    //send error
    res.status(400).json(error);
  }
});

// REVIEWS DELETE ROUTE
reviewsRouter.delete("/:id", async (req, res) => {
  try {
    // send all reviews
    res.json(await Reviews.findByIdAndRemove(req.params.id));
  } catch (error) {
    // send error
    res.status(400).json(error);
  }
});

// REVIEWS UPDATE ROUTE
reviewsRouter.put("/:id", async (req, res) => {
  try {
    req.body.uid = req.user.uid;
    //send all reviews
    res.json(
      await Reviews.findByIdAndUpdate(req.params.id, req.body, { new: true })
    );
  } catch (error) {
    // send error
    res.status(400).json(error);
  }
});

// REVIEW SHOW ROUTE
reviewsRouter.get("/:id", async (req, res) => {
  try {
    res.json(await Reviews.findByIdreq.params.id());
  } catch (error) {
    // send error
    res.status(400).json(error);
  }
});

module.exports = reviewsRouter;
