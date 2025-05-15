const multer = require("multer");

// Use memory storage for database storage
const storage = multer.memoryStorage();

// Improved file filter
const fileFilter = (req, file, cb) => {
  // List of supported image MIME types
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
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Please upload a supported image format (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF)."
      ),
      false
    );
  }
};

// Export the middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
