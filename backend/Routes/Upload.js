const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const File = require("../models/File");
const router = express.Router();
var convertapi = require('convertapi')('secret_JDL3V9MsHsRoDUAR');

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf"];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only .pdf files are allowed"), false);
};

// Multer Upload Middleware
const upload = multer({ storage, fileFilter });

// Upload and Merge Route
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "At least two PDFs are needed for merging" });
    }

    // Store file data in MongoDB and prepare file paths
    const uploadedFiles = req.files.map(file => {
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      return { filename: file.filename, fileType: file.mimetype, fileUrl };
    });

    await File.insertMany(uploadedFiles);

    const pdfPaths = req.files.map(file => file.fileUrl);

    // Use ConvertAPI to merge PDFs
    const result = await convertapi.convert('merge', {
      Files: pdfPaths,
      FileName: 'merged_files'
    }, 'pdf');

    const mergedFileUrl = result.file.url;
    console.log("Merged PDF URL:", mergedFileUrl);

    // Respond with merged PDF URL
    res.json({ message: "Files merged successfully", mergedFileUrl });

    // Optional: Clear DB after merging
    await File.deleteMany({});
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
