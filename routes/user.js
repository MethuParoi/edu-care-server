const express = require("express");
const { ObjectId } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

module.exports = (db) => {
  const userCollection = db.collection("userCollection");

  // Add user
  router.post("/add-user-data", async (req, res) => {
    try {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //add google auth user data
  router.post("/add-google-user-data", async (req, res) => {
    try {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);

      if (existingUser) {
        return res.send({ success: true });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  //get all users
  router.get("/get-all-users", async (req, res) => {
    try {
      const users = await userCollection.find({}).toArray();
      res.send(users);
    } catch (error) {
      res.status(500).send({ error: "Failed to get users" });
    }
  });

  //get single user by email
  router.get("/get-user/:email", async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };

      const user = await userCollection.findOne(query);

      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ error: "Failed to get user" });
    }
  });

  // Search Users by name or email
  router.get("/search-users", async (req, res) => {
    try {
      const { query } = req.query; // Get the search query from query parameters

      if (!query || query.trim() === "") {
        return res.status(400).send({ error: "Search query is required" });
      }

      const searchRegex = new RegExp(query, "i"); // Case-insensitive regex for partial matching
      const searchQuery = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      };

      const users = await userCollection.find(searchQuery).toArray();

      if (users.length === 0) {
        return res.status(404).send({ message: "No users found" });
      }

      res.send({ users });
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).send({ error: "Failed to search users" });
    }
  });

  //Make Admin
  router.patch("/make-admin/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(query, update);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to make admin" });
    }
  });

  //check admin
  router.get("/check-admin/:email", verifyToken, async (req, res) => {
    try {
      const email = req.params.email;
      if (!email) {
        return res.status(403).send({ error: "Forbidden access" });
      }
      const query = { email: email, role: "admin" };
      const isAdmin = await userCollection.findOne(query);
      res.send({ admin: true });
    } catch (error) {
      res.status(500).send({ error: "Failed to get admin" });
    }
  });

  //----------------------------------------------
  //insert liked meals
  router.post("/insert-liked-meals/:email", verifyToken, async (req, res) => {
    try {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const newLikedMeals = Array.isArray(req.body.likedMeals)
        ? req.body.likedMeals
        : [req.body.likedMeals];
      const update = {
        $set: {
          likedMeals:
            user && user.likedMeals
              ? [...user.likedMeals, ...newLikedMeals]
              : newLikedMeals,
        },
      };
      const result = await userCollection.updateOne(query, update, {
        upsert: true,
      });
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to update liked meals" });
    }
  });

  return router;
};
