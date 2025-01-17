const { ObjectId } = require("mongodb");

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

module.exports = (db) => {
  const mealCollection = db.collection("mealCollection");

  // Add meal
  router.post("/add-meal", async (req, res) => {
    try {
      const newFood = req.body;
      const result = await mealCollection.insertOne(newFood);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add meal" });
    }
  });

  // Get meals
  router.get("/get-featured-meal", async (req, res) => {
    try {
      const mealType = req.query.mealType;
      const query = mealType && mealType !== "all" ? { mealType } : {};
      const meals = await mealCollection.find(query).toArray();
      res.send(meals);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch meals" });
    }
  });

  // Get single meal details
  router.get("/get-meal-details/:id", verifyToken, async (req, res) => {
    try {
      const id = req.params.id;

      // Validate if the ID is a valid ObjectId
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid meal ID format" });
      }

      const objectId = new ObjectId(id);
      const query = { _id: objectId };

      const meal = await mealCollection.findOne(query);

      if (!meal) {
        return res.status(404).send({ error: "Meal not found" });
      }

      res.send(meal);
    } catch (error) {
      console.error("Error fetching meal details:", error); // Log for debugging
      res.status(500).send({ error: "Failed to fetch meal details" });
    }
  });

  // Get single meal details
  //   router.get("/get-meal-details/:id", async (req, res) => {
  //     try {
  //       const id = req.params.id;
  //       const objectId = new ObjectId(id);
  //       const query = { _id: objectId };
  //       const meal = await mealCollection.findOne(query);
  //       res.send(meal);
  //     } catch (error) {
  //       res.status(500).send({ error: "Failed to fetch meal details" });
  //     }
  //   });

  return router;
};
