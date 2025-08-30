const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../config.env') });

// Initialize Razorpay 
let razorpay;

try {
    console.log('Environment Variables Check:');
    console.log(`RAZORPAY_KEY_ID exists: ${!!process.env.RAZORPAY_KEY_ID}`);
    console.log(`RAZORPAY_KEY_SECRET exists: ${!!process.env.RAZORPAY_KEY_SECRET}`);
    
    // Check if valid keys are provided
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
        process.env.RAZORPAY_KEY_ID === 'rzp_test_YOUR_TEST_KEY_HERE' || 
        process.env.RAZORPAY_KEY_SECRET === 'YOUR_TEST_SECRET_HERE') {
        console.error('ERROR: Valid Razorpay API keys not found in environment variables!');
        console.error('Please update your config.env file with valid Razorpay test keys.');
    }
    
    // Use the environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!razorpayKeyId || !razorpayKeySecret) {
        throw new Error('Razorpay API keys are required. Check your environment configuration.');
    }
       
    // Initialize with the keys
    razorpay = new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret  
    });
    
    // Test the connection
    console.log('Testing Razorpay connection...');
    
    console.log(`Razorpay initialized with key_id: ${razorpayKeyId ? '********' + razorpayKeyId.slice(-4) : 'NOT SET'}`);
} catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw new Error('Failed to initialize Razorpay: ' + error.message);
}

module.exports = razorpay;
