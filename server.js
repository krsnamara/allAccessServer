// Dependencies //
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const express = require('express');
const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
require("dotenv").config();

const { PORT = 4000, MONGODB_URL, PRIVATE_KEY_ID, PRIVATE_KEY, CLIENT_ID } = process.env;

const app = express();

admin.initializeApp({ 
    credential: admin.credential.cert({
        "type": "service_account",
        "project_id": "react-peoples-service-app",
        "private_key_id": PRIVATE_KEY_ID,
        "private_key": PRIVATE_KEY.replace('\n', ''),
        "client_email": "firebase-adminsdk-5pruc@react-peoples-service-app.iam.gserviceaccount.com",
        "client_id": CLIENT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-5pruc%40react-peoples-service-app.iam.gserviceaccount.com"
      })
});

        // Database Connection //
// Establish Connect //
mongoose.connect(MONGODB_URL);

// Connection Events //
mongoose.connection
.on("open", () => console.log("You are connected to mongoose"))
.on("close", () => console.log("You are disconnected from mongoose"))
.on("error", (error) => console.log(error));

mongoose.set('strictQuery', true);

// Models
const ReviewsSchema = new mongoose.Schema({
    name: String,
    image: String,
    title: String,
    uid: String
}, {
    timestamps: true
});

const Reviews = mongoose.model("Reviews", ReviewsSchema);

// MiddleWare //
app.use(cors()); // to prevent cors errors, open access to all origins
app.use(morgan("dev")); // logging
app.use(express.json()); // parse json bodies

// Authentication/Authorization Middleware
app.use( async function(req, res, next) {
    try {
        const token = req.get('Authorization');
        if(token) {
            const user = await getAuth().verifyIdToken(token.replace('Bearer ', ''));
            req.user = user;
        } else {
            req.user = null;
        }
        
    } catch (error) {
        // perform additional tasks to follow up after and error
        req.user = null;
    }
    next() // this function invokes the next middleware function 
           //in the middleware stack/pipeline/conveyerbelt
})

function isAuthenticated(req, res, next){
    if(req.user) return next();
    res.status(401).json({ 
        message: 'You must login first'
    });
}

// Routes //

// create a test route //
app.get("/", (req, res) => {
    res.send("hello world");
});

// REVIEWS INDEX ROUTE
app.get("/reviews", async (req, res) => {
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
app.post("/reviews", async (req, res) => {
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
app.delete("/reviews/:id", isAuthenticated, async (req, res) => {
    try {
        // send all reviews
        res.json(await Reviews.findByIdAndRemove(req.params.id));

    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

// REVIEWS UPDATE ROUTE
app.put("/reviews/:id", isAuthenticated, async (req, res) => {
    try {
        req.body.uid = req.user.uid;
        //send all reviews
        res.json(
            await Reviews.findByIdAndUpdate(req.params.id, req.body, { new: true})
        );
    } catch (error) {
        // send error
        res.status(400).json(error);
    }
});

// Listener //
app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));