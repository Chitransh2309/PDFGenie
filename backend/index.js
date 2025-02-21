require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const uploadRoutes = require("./Routes/Upload");

const app = express();

// Middleware
const cors = require("cors");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // Frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/upload", uploadRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/",(req,res)=>{
  res.send("hello");
})