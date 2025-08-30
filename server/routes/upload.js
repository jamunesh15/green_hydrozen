const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, requireRole } = require('../middleware/auth');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Configure local storage for temporary files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter to allow only images and documents
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max file size
});

// Upload file to Cloudinary
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract user role and ID for folder organization
    const userRole = req.user.role;
    const userId = req.user._id;
    
    // Get category from request body (certificates, listing-images, etc.)
    const { category = 'general' } = req.body;
    
    // Create folder structure based on user role, user ID, and category
    const folder = `${process.env.FOLDER_NAME}/${userRole}/${userId}/${category}`;
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.path, folder);
    
    // Remove the temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        fileType: req.file.mimetype,
        fileName: req.file.originalname,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Delete file from Cloudinary
router.delete('/delete/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to delete file' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
});

// Upload multiple files at once
router.post('/upload-multiple', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Extract user role and ID for folder organization
    const userRole = req.user.role;
    const userId = req.user._id;
    
    // Get category from request body (certificates, listing-images, etc.)
    const { category = 'general' } = req.body;
    
    // Create folder structure
    const folder = `${process.env.FOLDER_NAME}/${userRole}/${userId}/${category}`;
    
    // Upload all files to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.path, folder).then(result => {
        // Remove the temporary file
        fs.unlinkSync(file.path);
        return {
          url: result.secure_url,
          publicId: result.public_id,
          fileType: file.mimetype,
          fileName: file.originalname,
          size: result.bytes
        };
      })
    );
    
    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multi-upload error:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

module.exports = router;
