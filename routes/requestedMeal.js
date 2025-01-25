const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const requestedMealCollection = db.collection("requestedMealCollection");
  // Add requested meal
  router.post("/add-requested-meal", verifyToken, async (req, res) => {
    try {
      const { id, user, status } = req.body;

      if (!id || !user || !status) {
        return res.status(400).send({ error: "ID and user are required" });
      }

      const newReqMeal = { id, user, status };

      // Upsert logic to create or update the requestedMealCollection
      const result = await requestedMealCollection.updateOne(
        {}, // Use an empty filter to target the collection-level document
        { $push: { meals: newReqMeal } }, // Push the new requested meal into the "meals" array
        { upsert: true } // Create the document if it doesn't exist
      );

      res.send({ message: "Meal added successfully", result });
    } catch (error) {
      console.error("Error adding requested meal:", error);
      res.status(500).send({ error: "Failed to add requested meal" });
    }
  });

  // Get requested-meal
  router.get("/get-requested-meal", verifyToken, async (req, res) => {
    try {
      const reviews = await requestedMealCollection.find({}).toArray();
      res.send(reviews);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch reviews" });
    }
  });

  return router;
};
