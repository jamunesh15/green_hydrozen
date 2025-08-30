const express = require('express');
const Application = require('../models/Application');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all pending applications
router.get('/applications/pending', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const applications = await Application.find({ status: 'pending' })
            .populate('producer', 'name companyName email phone')
            .sort({ createdAt: 1 });

        res.json({ applications });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending applications' });
    }
});

// Get all applications (with filters)
router.get('/applications', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        const filter = {};
        if (status) filter.status = status;

        const applications = await Application.find(filter)
            .populate('producer', 'name companyName email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)   
            .skip((page - 1) * limit);

        const total = await Application.countDocuments(filter);

        res.json({
            applications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Get specific application details
router.get('/applications/:id', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .populate('producer', 'name companyName email phone address');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ application });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application' });
    }
});

// Get application documents
router.get('/applications/:id/documents', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)
            .select('documents');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({ documents: application.documents || [] });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching application documents' });
    }
});

// Schedule inspection
router.post('/applications/:id/schedule', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { scheduledDate, scheduledTime, notes } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status: 'scheduled',
                'inspectionDetails.scheduledDate': scheduledDate,
                'inspectionDetails.scheduledTime': scheduledTime,
                'inspectionDetails.notes': notes,
                'inspectionDetails.inspector': req.user._id
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            message: 'Inspection scheduled successfully',
            application
        });

    } catch (error) {
        console.error('Scheduling error:', error);
        res.status(500).json({ message: 'Error scheduling inspection' });
    }
});

// Approve application
router.post('/applications/:id/approve', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { certifierNotes } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                'reviewNotes.certifierNotes': certifierNotes,
                'reviewNotes.approvedAt': new Date()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            message: 'Application approved successfully',
            application
        });

    } catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ message: 'Error approving application' });
    }
});

// Reject application
router.post('/applications/:id/reject', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                'reviewNotes.rejectionReason': rejectionReason,
                'reviewNotes.rejectedAt': new Date()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            message: 'Application rejected',
            application
        });

    } catch (error) {
        console.error('Rejection error:', error);
        res.status(500).json({ message: 'Error rejecting application' });
    }
});

// Get scheduled inspections
router.get('/inspections/scheduled', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const inspections = await Application.find({ 
            status: 'scheduled',
            'inspectionDetails.inspector': req.user._id
        })
        .populate('producer', 'name companyName phone')
        .sort({ 'inspectionDetails.scheduledDate': 1 });

        res.json({ inspections });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scheduled inspections' });
    }
});

// Get certifier dashboard stats
router.get('/dashboard', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const pendingApplications = await Application.countDocuments({ status: 'pending' });
        const scheduledInspections = await Application.countDocuments({ status: 'scheduled' });
        const approvedToday = await Application.countDocuments({
            status: 'approved',
            'reviewNotes.approvedAt': {
                $gte: new Date().setHours(0, 0, 0, 0)
            }
        });
        const totalApproved = await Application.countDocuments({ status: 'approved' });

        res.json({
            stats: {
                pendingApplications,
                scheduledInspections,
                approvedToday,
                totalApproved
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Update application status (generic endpoint)
router.patch('/applications/:id/status', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'scheduled', 'approved', 'rejected'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        // Additional updates based on status
        if (status === 'approved') {
            application.reviewNotes.approvedAt = new Date();
            await application.save();
        } else if (status === 'rejected') {
            application.reviewNotes.rejectedAt = new Date();
            await application.save();
        }

        res.json({
            message: `Application ${status} successfully`,
            application
        });

    } catch (error) {
        console.error('Status update error:', error);
        res.status(500).json({ message: 'Error updating application status' });
    }
});

module.exports = router; 