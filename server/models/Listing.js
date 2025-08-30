const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    producer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'kg'
    },
    availableQuantity: {
        type: Number,
        required: true
    },
    certificationDate: {
        type: Date,
        required: true
    },
    certificateNumber: {
        type: String,
        required: true
    },
    energySource: {
        type: String,
        required: true
    },
    carbonIntensity: Number,
    renewablePercentage: Number,
    location: {
        city: String,
        state: String,
        country: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update available quantity when updated
listingSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Listing', listingSchema); 