const { ObjectId } = require("mongodb");

const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

module.exports = (db) => {
  const mealCollection = db.collection("mealCollection");

  // Add meal
  router.post("/add-meal", verifyToken, async (req, res) => {
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

  //update a meal
  router.patch("/update-meal/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    // Convert id to ObjectId
    const objectId = new ObjectId(id);
    const updatedMeal = req.body;
    const result = await mealCollection.updateOne(
      { _id: objectId },
      { $set: updatedMeal }
    );
    res.send(result);
  });

  // Delete a food

  router.delete("/delete-meal/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    // Convert id to ObjectId
    const objectId = new ObjectId(id);
    const result = await mealCollection.deleteOne({ _id: objectId });
    res.send(result);
  });

  //increase like count
  router.patch("/increase-like/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    // Convert id to ObjectId
    const objectId = new ObjectId(id);
    const meal = await mealCollection.findOne({ _id: objectId });
    const updatedMeal = { ...meal, likes: meal.likes + 1 };
    const result = await mealCollection.updateOne(
      { _id: objectId },
      { $set: updatedMeal }
    );
    res.send(result);
  });

  //increase review count
  router.patch("/increase-review/:id", verifyToken, async (req, res) => {
    const id = req.params.id;
    // Convert id to ObjectId
    const objectId = new ObjectId(id);
    const meal = await mealCollection.findOne({ _id: objectId });
    const updatedMeal = { ...meal, reviewsCount: meal.reviewsCount + 1 };
    const result = await mealCollection.updateOne(
      { _id: objectId },
      { $set: updatedMeal }
    );
    res.send(result);
  });

  //-------------------------Upcoming Meals--------------------------------

  const upcomingMealCollection = db.collection("upcomingMealCollection");

  // Add upcoming meal
  router.post("/add-upcoming-meal", verifyToken, async (req, res) => {
    try {
      const newUpcomingMeal = req.body;
      const result = await upcomingMealCollection.insertOne(newUpcomingMeal);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add upcoming meal" });
    }
  });

  //get upcoming meals
  router.get("/get-upcoming-meals", async (req, res) => {
    try {
      const upcomingMeals = await upcomingMealCollection.find({}).toArray();
      res.send(upcomingMeals);
    } catch (error) {
      res.status(500).send({ error: "Failed to fetch upcoming meals" });
    }
  });

  return router;
};
