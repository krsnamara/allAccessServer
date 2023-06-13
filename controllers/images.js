// Traditional imports for controller
const express = require("express");
const imagesRouter = express.Router();
const Images = require("../models/images.js");

// Specific imports for image upload
const multer = require("multer");
// const crypto = require("crypto");
// const sharp = require("sharp");

// initialing the aws sdk and cloudfront signer
const {
  S3Client,
  // PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

// for naming the images uploaded with unique names
// const randomImageName = (bytes = 32) =>
//   crypto.randomBytes(bytes).toString("hex");

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
// const upload = multer({ storage: storage });

// cors middleware to allow access to the api from the frontend
imagesRouter.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // Replace with your frontend URL
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// TODO: Add authentication middleware
// TODO: Add seed data routes to repopulate the database

// Get all posts

imagesRouter.get("/", async (req, res) => {
  try {
    const posts = await Images.find().sort({ _id: -1 });

    for (const post of posts) {
      post.imageUrl = getSignedUrl({
        url: "https://d43rby6106out.cloudfront.net/" + post.imageName,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
      });
      console.log(process.env.CLOUDFRONT_KEY_PAIR_ID);
    }

    res.send(posts);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Post a new post

imagesRouter.post("/post", async (req, res) => {
  try {
    const post = new Images({
      name: req.body.name,
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

    await post.save();

    res.send(post);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// With S3 image upload

// imagesRouter.get("/", async (req, res) => {
//   try {
//     const posts = await Images.find().sort({ _id: -1 });

//     for (const post of posts) {
//       post.imageUrl = getSignedUrl({
//         url: "https://d43rby6106out.cloudfront.net/" + post.imageName,
//         dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
//         privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
//         keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
//       });
//       console.log(process.env.CLOUDFRONT_KEY_PAIR_ID);
//     }

//     res.send(posts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// // Post a new post

// imagesRouter.post("/post", upload.single("image"), async (req, res) => {
//   try {
//     const buffer = await sharp(req.file.buffer)
//       .resize({ height: 1920, width: 1080, fit: "contain" })
//       .toBuffer();

//     const imageName = randomImageName();

//     const params = {
//       Bucket: bucketName,
//       Key: imageName,
//       Body: buffer,
//       ContentType: req.file.mimetype,
//     };

//     const command = new PutObjectCommand(params);
//     await s3.send(command);

//     const post = new Images({
//       name: req.body.name,
//       imageName: imageName,
//       description: req.body.description,
//       address: req.body.address,
//       description: req.body.description,
//       reservation: req.body.reservation,
//       website: req.body.website,
//       suitability: req.body.suitability,
//       amenities: req.body.amenities,
//       categories: req.body.categories,
//       foodNightlife: req.body.foodNightlife,
//       attractions: req.body.attractions,
//       // Add other fields as needed
//     });

//     await post.save();

//     res.send(post);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: "Internal Server Error" });
//   }
// });

// delete a post

imagesRouter.delete("/post/:id", async (req, res) => {
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

module.exports = imagesRouter;
