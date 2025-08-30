const express = require('express');
const multer = require('multer');
const path = require('path');
const Application = require('../models/Application');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)){
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image and document files are allowed!'));
        }
    }
});

// Apply for certification
router.post('/apply', auth, requireRole(['producer']), upload.array('documents', 5), async (req, res) => {
    try {
        const {
            companyDetails,
            plantDetails,
            productionDetails
        } = req.body;

        // Handle uploaded files
        const documents = req.files ? req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path
        })) : [];

        const application = new Application({
            producer: req.user._id,
            companyDetails: JSON.parse(companyDetails),
            plantDetails: JSON.parse(plantDetails),
            productionDetails: JSON.parse(productionDetails),
            documents
        });

        await application.save();

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });

    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ message: 'Error submitting application' });
    }
});

// Apply for certification using JSON format (for demo/development purposes)
router.post('/apply-json', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { 
            companyDetails,
            plantDetails,
            productionDetails,
            documents
        } = req.body;

        // Debug logs
        console.log('Received documents in apply-json:', JSON.stringify(documents, null, 2));
        console.log('Energy source:', productionDetails.energySource);

        // Create a simplified application
        const application = new Application({
            producer: req.body.producerId || req.user._id, // Use authenticated user's ID
            applicationId: `APP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            companyDetails: {
                companyName: companyDetails.name,
                registrationNumber: 'DEMO-REG-123',
                taxId: 'DEMO-TAX-123'
            },
            plantDetails: {
                address: {
                    city: plantDetails.location || companyDetails.location,
                    country: 'Demo Country'
                },
                plantCapacity: plantDetails.productionCapacity,
                capacityUnit: 'kg/day'  
            },
            productionDetails: {
                energySource: productionDetails.energySource,
                productionMethod: plantDetails.productionType === 'green' ? 'electrolysis' : 'other',
                carbonIntensity: productionDetails.carbonIntensity,
                renewablePercentage: plantDetails.productionType === 'green' ? 100 : 50
            },
            documents: documents ? documents.map(doc => ({
                url: doc.url || doc.fileUrl,
                publicId: doc.publicId || doc.id || `document-${Date.now()}`,
                fileName: doc.name || doc.fileName || 'Unnamed document',
                fileType: doc.type || doc.fileType || 'application/octet-stream',
                size: doc.size || 0,
                category: doc.category || 'other'
            })) : [],
            status: 'pending'
        });

        await application.save();

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });

    } catch (error) {
        console.error('Application submission error:', error);
        console.error('Request body:', req.body);
        res.status(500).json({ 
            message: 'Error submitting application',
            error: error.message || 'Unknown error'
        });
    }
});

// Get producer's applications
router.get('/applications', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { status } = req.query;
        
        const filter = { producer: req.user._id };
        if (status) filter.status = status;
        
        const applications = await Application.find(filter)
            .sort({ createdAt: -1 });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get specific application
router.get('/applications/:id', auth, requireRole(['producer']), async (req, res) => {
    try {
        const application = await Application.findOne({
            _id: req.params.id,
            producer: req.user._id
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ application });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application' });
    }
});

// Create listing from approved application
router.post('/listings', auth, requireRole(['producer']), async (req, res) => {
    try {
        const {
            applicationId,
            title,
            description,
            price,
            quantity,
            availableQuantity
        } = req.body;

        // Verify application is approved
        const application = await Application.findOne({
            _id: applicationId,
            producer: req.user._id,
            status: 'approved'
        });

        if (!application) {
            return res.status(400).json({ message: 'No approved application found' });
        }

        // Generate certificate number
        const certificateNumber = `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const listing = new Listing({
            producer: req.user._id,
            application: applicationId,
            title,
            description,
            price,
            quantity,
            availableQuantity,
            certificationDate: application.reviewNotes.approvedAt,
            certificateNumber,
            energySource: application.productionDetails.energySource,
            carbonIntensity: application.productionDetails.carbonIntensity,
            renewablePercentage: application.productionDetails.renewablePercentage,
            location: application.plantDetails.address
        });

        await listing.save();

        res.status(201).json({
            message: 'Listing created successfully',
            listing
        });

    } catch (error) {
        console.error('Listing creation error:', error);
        res.status(500).json({ message: 'Error creating listing' });
    }
});

// Get producer's listings
router.get('/listings', auth, requireRole(['producer']), async (req, res) => {
    try {
        const listings = await Listing.find({ producer: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ listings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching listings' });
    }
});

// Update listing
router.put('/listings/:id', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { price, availableQuantity, isActive } = req.body;

        const listing = await Listing.findOneAndUpdate(
            { _id: req.params.id, producer: req.user._id },
            { price, availableQuantity, isActive },
            { new: true }
        );

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json({ listing });
    } catch (error) {
        res.status(500).json({ message: 'Error updating listing' });
    }
});

// Get producer dashboard stats
router.get('/dashboard', auth, requireRole(['producer']), async (req, res) => {
    try {
        const totalApplications = await Application.countDocuments({ producer: req.user._id });
        const approvedApplications = await Application.countDocuments({ 
            producer: req.user._id, 
            status: 'approved' 
        });
        const pendingApplications = await Application.countDocuments({ 
            producer: req.user._id, 
            status: { $in: ['pending', 'scheduled'] } 
        });

        const activeListings = await Listing.countDocuments({ 
            producer: req.user._id, 
            isActive: true 
        });

        res.json({
            stats: {
                totalApplications,
                approvedApplications,
                pendingApplications,
                activeListings
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Route to add documents to an existing application
router.post('/application/:id/documents', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { id } = req.params;
        const { documents } = req.body;
        
        if (!documents || !Array.isArray(documents)) {
            return res.status(400).json({ message: 'Documents array is required' });
        }
        
        // Find the application
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user owns this application
        if (application.producer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this application' });
        }
        
        // Add new documents to the application
        application.documents.push(...documents);
        
        // Update the application
        await application.save();
        
        res.status(200).json({
            message: 'Documents added successfully',
            application
        });
        
    } catch (error) {
        console.error('Error adding documents:', error);
        res.status(500).json({ message: 'Error adding documents to application' });
    }
});

// Route to remove a document from an application
router.delete('/application/:id/documents/:documentId', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { id, documentId } = req.params;
        
        // Find the application
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user owns this application
        if (application.producer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this application' });
        }
        
        // Find the document in the application
        const documentIndex = application.documents.findIndex(doc => doc._id.toString() === documentId);
        
        if (documentIndex === -1) {
            return res.status(404).json({ message: 'Document not found in this application' });
        }
        
        // Get document details for Cloudinary deletion
        const document = application.documents[documentIndex];
        
        // Remove the document from the application
        application.documents.splice(documentIndex, 1);
        await application.save();
        
        res.status(200).json({
            message: 'Document removed successfully',
            application
        });
        
    } catch (error) {
        console.error('Error removing document:', error);
        res.status(500).json({ message: 'Error removing document from application' });
    }
});

module.exports = router; 