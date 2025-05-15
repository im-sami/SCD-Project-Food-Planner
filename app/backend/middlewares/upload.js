const multer = require("multer");
const path = require("path");

// Set storage engine - we'll use memory storage since images go to the database
const storage = multer.memoryStorage();

// Check file type
const checkFileType = (file, cb) => {
  // Expanded list of image MIME types
  const validMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ];

  if (validMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  } else {
    cb(
      "Error: Unsupported image format. Please upload JPEG, PNG, GIF, WebP, SVG, BMP or TIFF images."
    );
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("image");

module.exports = { upload };
