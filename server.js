// Dependencies //
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
require("dotenv").config();
const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

// const {
//   PORT = 4000,
//   MONGODB_URL,
//   PRIVATE_KEY_ID,
//   PRIVATE_KEY,
//   CLIENT_ID,
// } = process.env;

const app = express();

//Firebase Config

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "react-peoples-service-app",
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace("\n", ""),
    client_email:
      "firebase-adminsdk-5pruc@react-peoples-service-app.iam.gserviceaccount.com",
    client_id: process.env.CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5pruc%40react-peoples-service-app.iam.gserviceaccount.com",
  }),
});

// Database Connection //
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// Establish Connect //
connectDB();

// Connection Events //
mongoose.connection
  .on("open", () => console.log("You are connected to mongoose"))
  .on("close", () => console.log("You are disconnected from mongoose"))
  .on("error", (error) => console.log(error));

mongoose.set("strictQuery", true);

// MiddleWare //
app.use(cors()); // to prevent cors errors, open access to all origins
app.use(morgan("dev")); // logging
app.use(express.json()); // parse json bodies

// Authentication/Authorization Middleware
app.use(async function (req, res, next) {
  try {
    const token = req.get("Authorization");
    if (token) {
      const user = await getAuth().verifyIdToken(token.replace("Bearer ", ""));
      req.user = user;
    } else {
      req.user = null;
    }
  } catch (error) {
    // perform additional tasks to follow up after and error
    req.user = null;
  }
  next(); // this function invokes the next middleware function
  //in the middleware stack/pipeline/conveyerbelt
});

// Controllers //

const reviewsController = require("./controllers/reviews");
app.use("/reviews", reviewsController);
const eventsController = require("./controllers/events");
app.use("/events", eventsController);
const imagesController = require("./controllers/images");
app.use("/images", imagesController);
const searchController = require("./controllers/search");
app.use("/search", searchController);

// create a test route //
app.get("/", (req, res) => {
  res.send("hello world");
});

// Listener //
app.listen(process.env.PORT, () =>
  console.log(`listening on PORT ${process.env.PORT}`)
);
