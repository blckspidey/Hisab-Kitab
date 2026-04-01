const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/'),
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('receipt'); // 'receipt' is the name of the form field

// Add error handling middleware
const uploadWithErrorHandling = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /\.(jpeg|jpg|png|pdf)$/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type - allow common image and pdf mime types
  const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const mimetype = allowedMimetypes.includes(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, or PDF files are allowed!'));
  }
}

module.exports = uploadWithErrorHandling;