const express = require('express');
const Razorpay = require('razorpay');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

// Create order for payment
router.post('/create-order', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const { listingId, quantity } = req.body;

        // Validate listing
        const listing = await Listing.findById(listingId);
        if (!listing || !listing.isActive) {
            return res.status(404).json({ message: 'Listing not available' });
        }

        if (quantity > listing.availableQuantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
        }

        // Calculate total amount
        const totalAmount = listing.price * quantity;

        // Create Razorpay order
        const orderOptions = {
            amount: totalAmount * 100, // Razorpay expects amount in paise
            currency: listing.currency || 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                listingId: listingId,
                buyerId: req.user._id.toString(),
                quantity: quantity.toString(),
                energySource: listing.energySource
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            listing: {
                id: listing._id,
                title: listing.title,
                price: listing.price,
                energySource: listing.energySource
            },
            quantity,
            totalAmount
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
});

// Verify payment and create transaction
router.post('/verify-payment', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            listingId,
            quantity
        } = req.body;

        // Verify payment signature
        const text = razorpayOrderId + '|' + razorpayPaymentId;
        const crypto = require('crypto');
        const signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest('hex');

        if (signature !== razorpaySignature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Get listing details
        const listing = await Listing.findById(listingId);
        if (!listing || !listing.isActive) {
            return res.status(404).json({ message: 'Listing not available' });
        }

        if (quantity > listing.availableQuantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
        }

        // Create transaction
        const transaction = new Transaction({
            buyer: req.user._id,
            producer: listing.producer,
            listing: listingId,
            quantity,
            unit: listing.unit,
            pricePerUnit: listing.price,
            totalAmount: listing.price * quantity,
            currency: listing.currency,
            paymentStatus: 'completed',
            razorpayOrderId,
            razorpayPaymentId,
            certificateNumber: `CERT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        });

        await transaction.save();

        // Update listing available quantity
        await Listing.findByIdAndUpdate(listingId, {
            availableQuantity: listing.availableQuantity - quantity,
            isActive: listing.availableQuantity - quantity > 0
        });

        // Generate certificate (in a real app, this would create a PDF)
        // For now, we'll just update the transaction with a placeholder path
        await Transaction.findByIdAndUpdate(transaction._id, {
            certificatePath: `/certificates/${transaction._id}.pdf`
        });

        res.json({
            message: 'Payment verified and transaction completed successfully',
            transaction: {
                id: transaction._id,
                transactionId: transaction.transactionId,
                certificateNumber: transaction.certificateNumber,
                totalAmount: transaction.totalAmount,
                quantity: transaction.quantity
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
});

// Get payment status
router.get('/status/:orderId', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            razorpayOrderId: req.params.orderId,
            buyer: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            transactionId: transaction.transactionId,
            status: transaction.paymentStatus,
            amount: transaction.totalAmount,
            certificateNumber: transaction.certificateNumber
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment status' });
    }
});

// Refund payment (admin/certifier only)
router.post('/refund/:transactionId', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { reason } = req.body;
        const transaction = await Transaction.findById(req.params.transactionId);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.paymentStatus !== 'completed') {
            return res.status(400).json({ message: 'Transaction is not completed' });
        }

        // Process refund through Razorpay
        const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
            amount: transaction.totalAmount * 100,
            notes: {
                reason: reason || 'Refund requested by certifier'
            }
        });

        // Update transaction status
        transaction.paymentStatus = 'refunded';
        transaction.status = 'cancelled';
        await transaction.save();

        // Restore listing quantity
        await Listing.findByIdAndUpdate(transaction.listing, {
            $inc: { availableQuantity: transaction.quantity },
            isActive: true
        });

        res.json({
            message: 'Refund processed successfully',
            refundId: refund.id,
            transaction
        });

    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
});

// Direct purchase endpoint (for demo/development purposes)
router.post('/purchase', auth, requireRole(['buyer']), async (req, res) => {
    try {
        const { listingId, quantity, amount } = req.body;

        // Validate listing
        const listing = await Listing.findById(listingId);
        if (!listing || !listing.isActive) {
            return res.status(404).json({ message: 'Listing not available' });
        }

        if (quantity > listing.availableQuantity) {
            return res.status(400).json({ message: 'Requested quantity exceeds available quantity' });
        }

        // Create transaction (simplified for demo)
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const txnId = `TXN-${year}-${randomNum}`;
        
        const transaction = new Transaction({
            buyer: req.user._id,
            producer: listing.producer,
            listing: listingId,
            quantity,
            unit: listing.unit || 'kg',
            pricePerUnit: listing.price || 0,
            totalAmount: amount || (listing.price * quantity),
            currency: listing.currency || 'INR',
            paymentStatus: 'completed',
            transactionId: txnId,
            certificateNumber: `CERT-${year}-${randomNum}`
        });

        await transaction.save();

        // Update listing available quantity
        await Listing.findByIdAndUpdate(listingId, {
            availableQuantity: listing.availableQuantity - quantity,
            isActive: listing.availableQuantity - quantity > 0
        });

        // Generate certificate (placeholder)
        await Transaction.findByIdAndUpdate(transaction._id, {
            certificatePath: `/certificates/${transaction._id}.pdf`
        });

        res.json({
            message: 'Purchase completed successfully',
            transaction: {
                id: transaction._id,
                transactionId: transaction.transactionId,
                certificateNumber: transaction.certificateNumber,
                totalAmount: transaction.totalAmount,
                quantity: transaction.quantity
            }
        });

    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'Error processing purchase' });
    }
});

// Get payment analytics (for certifiers)
router.get('/analytics', auth, requireRole(['certifier']), async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const startDate = new Date(Date.now() - period * 24 * 60 * 60 * 1000);

        const totalTransactions = await Transaction.countDocuments({
            transactionDate: { $gte: startDate }
        });

        const totalRevenue = await Transaction.aggregate([
            { $match: { transactionDate: { $gte: startDate }, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const totalQuantity = await Transaction.aggregate([
            { $match: { transactionDate: { $gte: startDate }, paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        const dailyStats = await Transaction.aggregate([
            { $match: { transactionDate: { $gte: startDate }, paymentStatus: 'completed' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$transactionDate' } },
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                    quantity: { $sum: '$quantity' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            period: `${period} days`,
            totalTransactions,
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            totalQuantity: totalQuantity.length > 0 ? totalQuantity[0].total : 0,
            dailyStats
        });

    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment analytics' });
    }
});

module.exports = router; 