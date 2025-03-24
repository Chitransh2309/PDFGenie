const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const router = express.Router();
var convertapi = require('convertapi')('secret_JDL3V9MsHsRoDUAR');
const open = require('open');
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
    const allowedTypes = [
      "application/pdf" 
    ];
  
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .pdf files are allowed"), false);
    }
  };
  

  const Files=[];
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
      Files.push(fileUrl);
      return { filename: file.filename, fileType: file.mimetype, fileUrl};
    });

    // Save all files to MongoDB
    await File.insertMany(uploadedFiles);

    res.json({ message: "Files uploaded successfully", files: uploadedFiles });

    convertapi.convert('merge', {Files: Files,FileName: 'merged_files'}, 'pdf').then(function(result) {
      (async () => {
        try {
          // Pass the 'new-window' option to open in a new tab/window
          await open(result.Files[0].Url, { newInstance: true });
          console.log('URL opened in a new tab:', url);
        } catch (err) {
          console.error('Failed to open URL:', err);
        }
      })();
    });

    const deleteAllFiles = async () => {
      try {
        const result = await File.deleteMany({});
        console.log(`${result.deletedCount} files deleted.`);
      } catch (err) {
        console.error("Error deleting files:", err);
      }
    };
    deleteAllFiles();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
