const express = require('express');
const { cloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Simple route accessible without auth for testing
router.get('/cloudinary-status', async (req, res) => {
  try {
    // Test the Cloudinary configuration
    console.log('Cloudinary configuration:');
    console.log('Cloud name:', process.env.CLOUD_NAME);
    console.log('API key exists:', !!process.env.API_KEY);
    console.log('API secret exists:', !!process.env.API_SECRET);
    console.log('Folder name:', process.env.FOLDER_NAME);

    // Try to ping Cloudinary
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error('Cloudinary ping error:', error);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to connect to Cloudinary',
          error: error.message,
          config: {
            cloudName: process.env.CLOUD_NAME,
            apiKeyExists: !!process.env.API_KEY,
            apiSecretExists: !!process.env.API_SECRET,
            folderName: process.env.FOLDER_NAME
          }
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Cloudinary is configured correctly',
        config: {
          cloudName: process.env.CLOUD_NAME,
          apiKeyExists: !!process.env.API_KEY,
          apiSecretExists: !!process.env.API_SECRET,
          folderName: process.env.FOLDER_NAME
        }
      });
    });
  } catch (error) {
    console.error('Cloudinary status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error checking Cloudinary status',
      error: error.message 
    });
  }
});

// Test upload a dummy file to Cloudinary
router.get('/test-upload', async (req, res) => {
  try {
    // Create a temporary file path
    const testData = { 
      test: 'This is a test', 
      timestamp: new Date().toISOString() 
    };

    // Try to upload a string as a file
    const result = await cloudinary.uploader.upload(
      "data:text/plain;base64," + Buffer.from(JSON.stringify(testData)).toString('base64'),
      { 
        folder: process.env.FOLDER_NAME || 'tests',
        resource_type: 'auto'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Test upload successful',
      result: {
        url: result.secure_url,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Test upload failed',
      error: error.message 
    });
  }
});

module.exports = router;
