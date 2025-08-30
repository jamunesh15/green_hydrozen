const express = require('express');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get buyer's purchase history
router.get('/purchases', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const transactions = await Transaction.find({ buyer: req.user._id })
            .populate('producer', 'name companyName')
            .populate('listing', 'title energySource')
            .sort({ transactionDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments({ buyer: req.user._id });

        res.json({
            transactions,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching purchases' });
    }
});

// Get specific transaction details
router.get('/purchases/:id', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            buyer: req.user._id
        })
        .populate('producer', 'name companyName phone address')
        .populate('listing', 'title description energySource carbonIntensity renewablePercentage');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({ transaction });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transaction' });
    }
});

// Get buyer dashboard stats
router.get('/dashboard', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const totalPurchases = await Transaction.countDocuments({ buyer: req.user._id });
        const totalSpent = await Transaction.aggregate([
            { $match: { buyer: req.user._id, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalQuantity = await Transaction.aggregate([
            { $match: { buyer: req.user._id, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);
        const recentPurchases = await Transaction.countDocuments({
            buyer: req.user._id,
            transactionDate: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        });

        res.json({
            stats: {
                totalPurchases,
                totalSpent: totalSpent.length > 0 ? totalSpent[0].total : 0,
                totalQuantity: totalQuantity.length > 0 ? totalQuantity[0].total : 0,
                recentPurchases
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
});

// Get downloadable certificates
router.get('/certificates', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const certificates = await Transaction.find({
            buyer: req.user._id,
            paymentStatus: 'completed'
        })
        .populate('producer', 'name companyName')
        .populate('listing', 'title energySource')
        .select('certificateNumber certificatePath quantity unit producer listing transactionDate')
        .sort({ transactionDate: -1 });

        res.json({ certificates });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching certificates' });
    }
});

// Download certificate (this will be handled by the payment route after successful payment)
router.get('/certificates/:id/download', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            buyer: req.user._id,
            paymentStatus: 'completed'
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        if (!transaction.certificatePath) {
            return res.status(404).json({ message: 'Certificate file not available' });
        }

        // In a real application, you would serve the file here
        // For now, we'll return the certificate details
        res.json({
            message: 'Certificate download initiated',
            certificate: {
                certificateNumber: transaction.certificateNumber,
                producer: transaction.producer,
                quantity: transaction.quantity,
                unit: transaction.unit,
                transactionDate: transaction.transactionDate
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error downloading certificate' });
    }
});

// Get buyer profile
router.get('/profile', auth, requireRole(['buyer']), async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Update buyer profile
router.put('/profile', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, address },
            { new: true }
        ).select('-password');

        res.json({ user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Alias /transactions to /purchases for backward compatibility
router.get('/transactions', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const transactions = await Transaction.find({ buyer: req.user._id })
            .populate('producer', 'name companyName')
            .populate('listing', 'title energySource')
            .sort({ transactionDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Transaction.countDocuments({ buyer: req.user._id });

        res.json({
            transactions,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

module.exports = router; 