const functions = require("firebase-functions");

const express = require("express");
const app = express();
const admin = require("firebase-admin");

const serviceAccount = require("./credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


app.use(require("./routes/products.routes"));
app.use(require('./routes/tuasiento.routes'));

app.get("/hello-world", (req, res) => {
  return res.status(200).json({
    message: "Hello World!",
  });
});


exports.app = functions.https.onRequest(app);