const express = require('express');
const { auth } = require('../middleware/auth');
const { cloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Debug route for Cloudinary configuration
router.get('/debug', auth, async (req, res) => {
  try {
    // Return sanitized configuration (without secrets)
    res.status(200).json({
      cloudinaryConfigured: true,
      cloudName: process.env.CLOUD_NAME,
      folderName: process.env.FOLDER_NAME,
      apiKeyExists: !!process.env.API_KEY,
      apiSecretExists: !!process.env.API_SECRET,
      envVariables: Object.keys(process.env).filter(key => 
        ['CLOUD_NAME', 'API_KEY', 'API_SECRET', 'FOLDER_NAME'].includes(key)
      )
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Error getting configuration', error: error.message });
  }
});

// Test Cloudinary connection
router.get('/test', auth, async (req, res) => {
  try {
    // Test the Cloudinary connection by getting account details
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error('Cloudinary connection error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to connect to Cloudinary',
          error: error.message
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Successfully connected to Cloudinary',
        result
      });
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing Cloudinary connection',
      error: error.message 
    });
  }
});

module.exports = router;
