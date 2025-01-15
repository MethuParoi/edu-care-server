// require("dotenv").config();
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const express = require("express");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

// const app = express();

// //use middleware
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://share-bites-9867f.web.app"],
//     credentials: true,
//     // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     // allowedHeaders: "Content-Type,Authorization",
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// // Verify JWT Middleware
// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   // console.log("Token received:", token);
//   if (!token) {
//     return res.status(403).send("A token is required for authentication");
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     req.user = decoded;
//   } catch (err) {
//     return res.status(401).send("Invalid Token");
//   }
//   return next();
// };

// //mongoDB connection

// // const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@share-bites-cluster.blv9c.mongodb.net/?retryWrites=true&w=majority&appName=share-bites-cluster`;

// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cloud-hostel.pvsqr.mongodb.net/?retryWrites=true&w=majority&appName=cloud-hostel`;

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // await client.connect();
//     // add a new food
//     const mealCollection = client
//       .db("cloud-hostel")
//       .collection("mealCollection");
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//     const userCollection = client
//       .db("cloud-hostel")
//       .collection("userCollection");

//     //user related api
//     app.post("/add-user", async (req, res) => {
//       const newUser = req.body;
//       const result = await userCollection.insertOne(newUser);
//       res.send(result);
//     });
//     //------------------------------------------
//     //jwt authentication
//     app.post("/jwt-auth", (req, res) => {
//       const { email } = req.body;
//       const token = jwt.sign({ email }, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: "5h",
//       });
//       res
//         .cookie("token", token, {
//           httpOnly: true,

//           //after deploying to https
//           secure: process.env.NODE_ENV === "production",
//           sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

//           // secure: false, // set to true after deploying to https
//           // sameSite: 'none'
//         })
//         .send({ success: false });
//     });

//     //logout
//     app.post("/logout", (req, res) => {
//       res.clearCookie("token", { path: "/", httpOnly: true, secure: true });
//       res.status(200).send({ success: true });
//       // res
//       //   .clearCookie("token", {
//       //     httpOnly: true,
//       //     secure: false,
//       //   })
//       //   .send({ success: true });
//     });

//     //jwt get
//     app.get("/jwt-get", verifyToken, (req, res) => {
//       // console.log("User data from token:", req.user);
//       // console.log("cookies", req.cookies.token);
//       res.send({ success: true });
//     });

//     //------------------ Add Meal----------------------
//     //add meal
//     app.post("/add-meal", async (req, res) => {
//       // if (req.user.email !== req.query.email) {
//       //   console.log("User email:", req.user.email);
//       //   console.log("Query email:", req.query.email);
//       //   return res.status(403).send("Not authorized");
//       // }
//       const newFood = req.body;
//       const result = await mealCollection.insertOne(newFood);
//       res.send(result);
//     });

//     //------------------ get Meal----------------------
//     //get meal
//     app.get("/get-featured-meal", async (req, res) => {
//       const mealType = req.query.mealType;
//       let query = {};
//       if (mealType && mealType !== "all") {
//         query = { mealType: mealType };
//       }
//       const cursor = mealCollection.find(query);
//       const result = await cursor.toArray();
//       res.send(result);
//     });

//     //get single meal details
//     app.get("/get-meal-details/:id", async (req, res) => {
//       const id = req.params.id;
//       const objectId = new ObjectId(id);
//       const query = { _id: objectId };
//       const result = await mealCollection.findOne(query);
//       res.send(result);
//     });
//   } catch (error) {
//     console.log(error);
//   }
// }
// run().catch(console.dir);

// //-------------------------------------

// // const rootRouter = require("./routes/index");
// // app.use("/api", rootRouter);

// app.get("/", (req, res) => {
//   res.send("cloudHostel server running");
// });

// const port = process.env.PORT || 3000;
// app.listen(port, (err) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log(`listening on port: ${port}`);
// });

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
