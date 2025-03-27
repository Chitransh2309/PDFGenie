const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const router = express.Router();
const fs = require("fs");
const ConvertAPI = require("convertapi")("secret_JDL3V9MsHsRoDUAR"); // Your ConvertAPI Key

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
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only .pdf files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload Route
router.post("/", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      fileType: file.mimetype,
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    }));

    await File.insertMany(uploadedFiles);

    // Extract URLs
    const fileUrls = uploadedFiles.map(file => file.fileUrl);

    // Merge PDFs using ConvertAPI
    const result = await ConvertAPI.convert("merge", { Files: fileUrls }, "pdf");
    const mergedFileUrl = result.file.url;

    // Download and Save Merged File
    const mergedFilename = `merged-${Date.now()}.pdf`;
    const mergedFilePath = path.join(__dirname, "../uploads", mergedFilename);

    const mergedFile = await fetch(mergedFileUrl);
    const buffer = await mergedFile.arrayBuffer();
    fs.writeFileSync(mergedFilePath, Buffer.from(buffer));

    // Store merged file in database
    const mergedFileDoc = await File.create({
      filename: mergedFilename,
      fileType: "application/pdf",
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${mergedFilename}`
    });

    res.json({ message: "PDFs merged successfully", mergedFile: mergedFileDoc.fileUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
