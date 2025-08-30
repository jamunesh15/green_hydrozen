const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    producer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applicationId: {
        type: String,
        unique: true,
        required: true
    },
    companyDetails: {
        companyName: {
            type: String,
            required: true
        },
        registrationNumber: String,
        taxId: String
    },
    plantDetails: {
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        plantCapacity: {
            type: Number,
            required: true
        },
        capacityUnit: {
            type: String,
            default: 'kg/day'
        }
    },
    productionDetails: {
        energySource: {
            type: String,
            enum: ['solar', 'wind', 'hydro', 'nuclear', 'biomass', 'natural_gas', 'grid', 'other'],
            required: true
        },
        productionMethod: {
            type: String,
            enum: ['electrolysis', 'steam reforming', 'biomass gasification', 'other'],
            required: true
        },
        carbonIntensity: Number, // gCO2/kWh
        renewablePercentage: Number // percentage of renewable energy used
    },
    documents: [{
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
        size: Number,
        category: {
            type: String,
            enum: ['plant-images', 'company-documents', 'certifications', 'process-diagrams', 'other'],
            default: 'other'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'scheduled', 'approved', 'rejected'],
        default: 'pending'
    },
    inspectionDetails: {
        scheduledDate: Date,
        scheduledTime: String,
        notes: String,
        inspector: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    reviewNotes: {
        certifierNotes: String,
        rejectionReason: String,
        approvedAt: Date,
        rejectedAt: Date
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

// Generate application ID before saving
applicationSchema.pre('save', function(next) {
    if (this.isNew) {
        const year = new Date().getFullYear();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.applicationId = `APP-${year}-${randomNum}`;
    }
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Application', applicationSchema); 