const express = require("express");
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const ConvertAPI = require("convertapi")('secret_JDL3V9MsHsRoDUAR');
const File = require("../models/File");
const router = express.Router();

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf files are allowed"), false);
  }
};

// Multer Upload Middleware
const upload = multer({ storage, fileFilter });

// Upload Route
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Store file data in MongoDB
    const uploadedFiles = req.files.map(file => {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      return { filename: file.filename, fileType: file.mimetype, fileUrl };
    });

    // Save all files to MongoDB
    await File.insertMany(uploadedFiles);

    res.json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PDF Merge Route
router.post("/merge", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || ids.length < 2) {
      return res.status(400).json({ error: "At least two PDF IDs are required for merging." });
    }

    // Fetch PDFs from MongoDB
    const files = await File.find({ _id: { $in: ids } });
    if (files.length !== ids.length) {
      return res.status(404).json({ error: "Some files not found." });
    }

    const pdfUrls = files.map(file => file.fileUrl);

    // Use ConvertAPI to merge PDFs
    const result = await ConvertAPI.convert("merge", { files: pdfUrls }, "pdf");
    const mergedFileUrl = result.file.url;

    res.json({ mergedFileUrl });
  } catch (error) {
    console.error("Error merging PDFs:", error);
    res.status(500).json({ error: "Failed to merge PDFs." });
  }
});

module.exports = router;
