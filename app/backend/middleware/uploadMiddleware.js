const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `recipe-${uniqueSuffix}${ext}`);
  },
});

// Improved file filter
const fileFilter = (req, file, cb) => {
  // Check both mimetype and file extension
  const filetypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith("image/");

  if (mimetype && extname) {
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
