// Traditional imports for controller
const express = require("express");
const imagesRouter = express.Router();
const Images = require("../models/images.js");
const isAuthenticated = require("../services/isAuth.js");

// Specific imports for image upload
const multer = require("multer");
const crypto = require("crypto");
const sharp = require("sharp");

// initialing the aws sdk and cloudfront signer
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

// for naming the images uploaded with unique names
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

// gaining access to the s3 bucket
const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// setting up multer to handle the image upload and memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const Auth = isAuthenticated;

// TODO: Add authentication middleware
// TODO: Add seed data routes to repopulate the database

imagesRouter.get("/", Auth, async (req, res) => {
  try {
    if (req.user) {
      const images = await Images.find({ uid: req.user.uid }).sort({
        createdAt: 1,
      });

      const updatedImages = [];
      for (const image of images) {
        const imageObject = image.toObject(); // Convert Mongoose document to plain JavaScript object
        imageObject.imageUrl = getSignedUrl({
          url: "https://d43rby6106out.cloudfront.net/" + image.imageName,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
          privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
        });
        updatedImages.push(imageObject); // Push the updated imageObject to the new array
      }

      res.send(updatedImages); // Send the updatedImages array to the frontend
    } else {
      const images = await Images.find().sort({ createdAt: 1 });

      const updatedImages = [];
      for (const image of images) {
        const imageObject = image.toObject(); // Convert Mongoose document to plain JavaScript object
        imageObject.imageUrl = getSignedUrl({
          url: "https://d43rby6106out.cloudfront.net/" + image.imageName,
          dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
          privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
          keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
        });
        updatedImages.push(imageObject); // Push the updated imageObject to the new array
      }

      res.send(updatedImages);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Post a new post

imagesRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    req.body.uid = req.user.uid;
    const buffer = await sharp(req.file.buffer)
      .resize({ height: 529, width: 700 })
      .toBuffer();

    const imageName = randomImageName();

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const event = new Images({
      name: req.body.name,
      eventType: req.body.eventType,
      imageName: imageName,
      description: req.body.description,
      address: req.body.address,
      description: req.body.description,
      reservation: req.body.reservation,
      website: req.body.website,
      suitability: req.body.suitability,
      amenities: req.body.amenities,
      categories: req.body.categories,
      foodNightlife: req.body.foodNightlife,
      attractions: req.body.attractions,
      // Add other fields as needed
    });

    await event.save();

    res.send(event);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error On Post Method" });
  }
});

// delete a post

imagesRouter.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id.toString();

    const post = await Images.findById(id);
    if (!post) {
      res.status(404).send({ message: "Post not found" });
      return;
    }

    const params = {
      Bucket: bucketName,
      Key: post.imageName,
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    await Images.findByIdAndDelete(id);

    res.send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

imagesRouter.put("/:id", Auth, upload.single("image"), async (req, res) => {
  try {
    req.body.uid = req.user.uid;
    const id = req.params.id.toString();

    const image = await Images.findById(id);
    if (!image) {
      res.status(404).send({ message: "Image not found" });
      return;
    }

    if (req.file) {
      // If a new image file is provided, update the image in the S3 bucket
      const buffer = await sharp(req.file.buffer)
        .resize({ height: 529, width: 700 })
        .toBuffer();

      const params = {
        Bucket: bucketName,
        Key: image.imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);
    }

    // Update other fields of the image object if needed
    image.name = req.body.name || image.name;
    image.eventType = req.body.eventType || image.eventType;
    image.description = req.body.description || image.description;
    image.address = req.body.address || image.address;
    image.reservation = req.body.reservation || image.reservation;
    image.website = req.body.website || image.website;
    image.suitability = req.body.suitability || image.suitability;
    image.amenities = req.body.amenities || image.amenities;
    image.categories = req.body.categories || image.categories;
    image.foodNightlife = req.body.foodNightlife || image.foodNightlife;
    image.attractions = req.body.attractions || image.attractions;

    await image.save();

    const updatedImage = image.toObject(); // Convert Mongoose document to plain JavaScript object
    updatedImage.imageUrl = getSignedUrl({
      url: "https://d43rby6106out.cloudfront.net/" + image.imageName,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    });

    res.send(updatedImage);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

imagesRouter.get("/:id", async (req, res) => {
  try {
    const id = req.params.id.toString();

    const image = await Images.findById(id);
    if (!image) {
      res.status(404).send({ message: "Image not found" });
      return;
    }

    const imageObject = image.toObject(); // Convert Mongoose document to plain JavaScript object
    imageObject.imageUrl = getSignedUrl({
      url: "https://d43rby6106out.cloudfront.net/" + image.imageName,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
      keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    });

    res.send(imageObject);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = imagesRouter;
