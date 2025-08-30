const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../models/Transaction');
const Listing = require('../models/Listing');

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a new payment order
exports.createOrder = async (req, res) => {
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
            totalAmount,
            keyId: process.env.RAZORPAY_KEY_ID // Send key ID for frontend initialization
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

// Verify payment signature and create transaction
exports.verifyPayment = async (req, res) => {
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
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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
            success: true,
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
        res.status(500).json({ success: false, message: 'Error verifying payment' });
    }
};

// Get payment status for an order
exports.getPaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const payment = await razorpay.orders.fetchPayments(orderId);
        
        res.json({
            orderId,
            payments: payment.items || []
        });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({ message: 'Error checking payment status' });
    }
};

// Process refund for a transaction
exports.processRefund = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { reason } = req.body;
        
        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Check if the transaction belongs to the requesting user
        if (transaction.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to refund this transaction' });
        }
        
        // Process refund through Razorpay
        const refund = await razorpay.payments.refund(transaction.razorpayPaymentId, {
            amount: transaction.totalAmount * 100,
            notes: {
                reason: reason || 'Customer requested refund',
                transactionId
            }
        });
        
        // Update transaction status
        await Transaction.findByIdAndUpdate(transactionId, {
            paymentStatus: 'refunded'
        });
        
        res.json({
            success: true,
            message: 'Refund processed successfully',
            refund
        });
        
    } catch (error) {
        console.error('Refund processing error:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
};
