// Traditional imports for controller
const express = require("express");
const searchRouter = express.Router();
const Events = require("../models/images.js");

const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

// Routes //

searchRouter.get("/events", async (req, res) => {
  const {
    limit = 5,
    orderByName = "name",
    sortBy = "asc",
    keyword,
  } = req.query;
  let page = +req.query?.page;

  if (!page || page < 0) page = 1;

  const skip = (page - 1) * limit;

  const query = {};

  if (keyword)
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { eventType: { $regex: keyword, $options: "i" } },
      { address: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];

  try {
    const data = await Events.find(query)
      .skip(skip)
      .limit(+limit)
      .sort({ [orderByName]: sortBy });

    const updatedData = [];
    for (const event of data) {
      const eventObject = event.toObject(); // Convert Mongoose document to plain JavaScript object
      eventObject.imageUrl = getSignedUrl({
        url: "https://d43rby6106out.cloudfront.net/" + event.imageName,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
      });
      updatedData.push(eventObject); // Push the updated eventObject to the new array
    }

    const totalItems = await Events.countDocuments(query);
    return res.status(200).json({
      msg: "Here's your data from search router",
      data: updatedData,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      limit: +limit,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Something went wrong with search router",
      error,
    });
  }
});

module.exports = searchRouter;

// https://www.youtube.com/watch?v=mFDJ7l2lM5I&ab_channel=NHNTV is the source of the search bar code
