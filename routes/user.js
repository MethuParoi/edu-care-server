const express = require("express");
const router = express.Router();

module.exports = (db) => {
  const userCollection = db.collection("userCollection");

  // Add user
  router.post("/add-user", async (req, res) => {
    try {
      const newUser = req.body;
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to add user" });
    }
  });

  return router;
};
