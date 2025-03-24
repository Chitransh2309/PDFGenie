const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const router = express.Router();
var convertapi = require('convertapi')('secret_JDL3V9MsHsRoDUAR');
const open = require('open');

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

const upload = multer({ storage, fileFilter });

// Upload Route
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Collect files in a new array for each upload
    const files = req.files.map(file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

    // Store file data in MongoDB
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      fileType: file.mimetype,
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    }));

    await File.insertMany(uploadedFiles);

    // Send response before conversion (if needed)
    res.json({ message: "Files uploaded successfully", files: uploadedFiles });

    // Convert and open the merged file in a new tab
    const result = await convertapi.convert('merge', { Files:files, FileName: 'merged_files' }, 'pdf');
    await open(result.Files[0].Url, { newInstance: true });
    console.log('URL opened in a new tab:', result.Files[0].Url);

    // Delete all files after upload
    const deleteResult = await File.deleteMany({});
    console.log(`${deleteResult.deletedCount} files deleted.`);

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
