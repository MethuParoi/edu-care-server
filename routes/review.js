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
      const query = { _id: new ObjectId(id) };
      const update = { $push: { reviews: newReview } };
      const result = await reviewCollection.updateOne(query, update, {
        upsert: true,
      });
      res.send(result);
    } catch (error) {
      console.error("Error adding review:", error);
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
