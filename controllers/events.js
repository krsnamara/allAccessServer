const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const sharp = require("sharp");
const eventsRouter = express.Router();
const isAuthenticated = require("../utils/isAuth.js");
const Events = require("../models/events.js");
const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "http://localhost:3000",
    "https://all-access-client.vercel.app/"
  ); // Replace with your frontend URL
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

// EVENTS INDEX ROUTE
eventsRouter.get("/", async (req, res) => {
  try {
    const posts = await Images.findMany({ orderBy: { id: "desc" } });

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
    res.status(400).json(error);
  }
});

// EVENTS CREATE ROUTE
eventsRouter.post("/posts", upload.single("image"), async (req, res) => {
  try {
    console.log("req.body", req.body);
    console.log("req.file", req.file);

    const buffer = await sharp(req.file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
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

    const post = await prisma.posts.create({
      data: {
        caption: req.body.caption,
        imageName: imageName,
      },
    });

    res.send(post);
  } catch (error) {
    res.status(400).json(error);
  }
});

// EVENTS DELETE ROUTE
eventsRouter.delete("/posts/:id", async (req, res) => {
  try {
    const id = req.params.id.toString();

    const post = await prisma.posts.findUnique({ where: { id } });
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

    await prisma.posts.delete({ where: { id } });

    res.send(post);
  } catch (error) {
    res.status(400).json(error);
  }
});

// EVENTS UPDATE ROUTE
eventsRouter.put("/:id", async (req, res) => {
  try {
    req.body.uid = req.user.uid;
    //send all events
    res.json(
      await Events.findByIdAndUpdate(req.params.id, req.body, { new: true })
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
