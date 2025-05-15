const multer = require("multer");
const path = require("path");

// Set storage engine
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type
const checkFileType = (file, cb) => {
  // Expanded list of image extensions
  const filetypes = /jpeg|jpg|png|gif|webp|svg|bmp|tiff/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith("image/");

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Images only (jpeg, jpg, png, gif, webp, svg, bmp, tiff)!");
  }
};

// Initialize upload
const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // Increased to 5MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("image");

module.exports = { upload };
