require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectToDatabase = require("./database/mongoClient");
const verifyToken = require("./middleware/verifyToken");
const userRoutes = require("./routes/user");
const mealRoutes = require("./routes/meal");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://share-bites-9867f.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Main Function
async function main() {
  try {
    const client = await connectToDatabase();
    const db = client.db("cloud-hostel");

    // Routes
    app.use("/api/user", userRoutes(db));
    app.use("/api/meal", mealRoutes(db));

    // Root Endpoint
    app.get("/", (req, res) => {
      res.send("cloudHostel server running");
    });

    // Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

main();
