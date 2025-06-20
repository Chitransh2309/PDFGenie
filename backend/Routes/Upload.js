const express = require("express");
const multer = require("multer");
const path = require("path");
const File = require("../models/File");
const router = express.Router();
const fs = require("fs");
const ConvertAPI = require("convertapi")("0yPTP8QxcWSc4F2ybGbkmNknUdfgoFsc"); 

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
// router.post("/", upload.array("files", 10), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ error: "No files uploaded" });
//     }

//     // Store file details in MongoDB
//     const uploadedFiles = req.files.map(file => {
//       const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
//       return { filename: file.filename, fileType: file.mimetype, fileUrl };
//     });

//     // Save files to MongoDB
//     await File.insertMany(uploadedFiles);

//     res.json({ message: "Files uploaded successfully", files: uploadedFiles });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/merge", upload.array("files", 10), async (req, res) => {
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


router.post("/compress", upload.array("files", 10), async (req, res) => {
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

    const result = await ConvertAPI.convert("compress", { File: fileUrls[0],Preset: 'web' }, "pdf");
    const compressedFileUrl = result.file.url;

    // Download and Save Compressed File
    const compressedFilename = `compressed-${Date.now()}.pdf`;
    const compressedFilePath = path.join(__dirname, "../uploads", compressedFilename);

    const compressedFile = await fetch(compressedFileUrl);
    const buffer = await compressedFile.arrayBuffer();
    fs.writeFileSync(compressedFilePath, Buffer.from(buffer));

    // Store compressed file in MongoDB
    const compressedFileDoc = await File.create({
      filename: compressedFilename,
      fileType: "application/pdf",
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${compressedFilename}`
    });

    res.json({ message: "PDF compressed successfully", compressedFile: compressedFileDoc.fileUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/redact", upload.array("files", 10), async (req, res) => {
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

    const result = await ConvertAPI.convert("redact", { File: fileUrls[0]}, "pdf");
    const redactFileUrl = result.file.url;

    // Download and Save redact File
    const redactFilename = `redact-${Date.now()}.pdf`;
    const redactFilePath = path.join(__dirname, "../uploads", redactFilename);

    const redactFile = await fetch(redactFileUrl);
    const buffer = await redactFile.arrayBuffer();
    fs.writeFileSync(redactFilePath, Buffer.from(buffer));

    // Store redact file in MongoDB
    const redactFileDoc = await File.create({
      filename: redactFilename,
      fileType: "application/pdf",
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${redactFilename}`
    });

    res.json({ message: "PDF redacted successfully", redactFile: redactFileDoc.fileUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/flatten", upload.array("files", 10), async (req, res) => {
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

    const result = await ConvertAPI.convert("flatten", { File: fileUrls[0]}, "pdf");
    const flattenFileUrl = result.file.url;

    // Download and Save redact File
    const flattenFilename = `flatten-${Date.now()}.pdf`;
    const flattenFilePath = path.join(__dirname, "../uploads", flattenFilename);

    const flattenFile = await fetch(flattenFileUrl);
    const buffer = await flattenFile.arrayBuffer();
    fs.writeFileSync(flattenFilePath, Buffer.from(buffer));

    // Store redact file in MongoDB
    const flattenFileDoc = await File.create({
      filename: flattenFilename,
      fileType: "application/pdf",
      fileUrl: `${req.protocol}://${req.get("host")}/uploads/${flattenFilename}`
    });

    res.json({ message: "PDF flattened successfully", flattenFile: flattenFileDoc.fileUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
