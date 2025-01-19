const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const reviewCollection = db.collection("reviewCollection");
  // Add review
  router.post("/add-review/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add review" });
    }
  });

  // Get reviews
  router.get("/get-reviews", verifyToken, async (req, res) => {
    try {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch reviews" });
    }
  });

  return router;
};
