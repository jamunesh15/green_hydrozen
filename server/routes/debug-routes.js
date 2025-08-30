// Debug route for Cloudinary configuration
router.get('/debug-config', auth, async (req, res) => {
  try {
    // Return sanitized configuration (without secrets)
    res.status(200).json({
      cloudinaryConfigured: true,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folderName: process.env.FOLDER_NAME,
      apiKeyExists: !!process.env.CLOUDINARY_API_KEY,
      apiSecretExists: !!process.env.CLOUDINARY_API_SECRET
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Error getting configuration' });
  }
});

// Test Cloudinary connection
router.get('/test-connection', auth, async (req, res) => {
  try {
    // Test the Cloudinary connection by getting account details
    const { cloudinary } = require('../utils/cloudinary');
    
    // Use a simple ping call
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
