const express = require('express');
const Listing = require('../models/Listing');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all active listings with filters
router.get('/listings', async (req, res) => {
    try {
        const { 
            search, 
            energySource, 
            minPrice, 
            maxPrice, 
            minQuantity, 
            maxQuantity,
            sortBy = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;

        // Build filter object
        const filter = { isActive: true };
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (energySource) {
            filter.energySource = energySource;
        }
        
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        
        if (minQuantity || maxQuantity) {
            filter.availableQuantity = {};
            if (minQuantity) filter.availableQuantity.$gte = parseFloat(minQuantity);
            if (maxQuantity) filter.availableQuantity.$lte = parseFloat(maxQuantity);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = order === 'desc' ? -1 : 1;

        const listings = await Listing.find(filter)
            .populate('producer', 'name companyName')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Listing.countDocuments(filter);

        res.json({
            listings,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });

    } catch (error) {
        console.error('Marketplace listings error:', error);
        res.status(500).json({ message: 'Error fetching listings' });
    }
});

// Get specific listing details
router.get('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('producer', 'name companyName phone address')
            .populate('application', 'productionDetails plantDetails');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // If producer is not populated correctly, add a placeholder
        if (!listing.producer) {
            listing.producer = { name: 'Unknown Producer' };
        }

        if (!listing.isActive && !req.query.includeInactive) {
            return res.status(404).json({ message: 'Listing is not available' });
        }

        // Transform data for client
        const listingResponse = {
            ...listing.toObject(),
            // Add a price alias if needed
            pricePerKg: listing.price
        };

        res.json({ listing: listingResponse });
    } catch (error) {
        console.error('Error fetching listing details:', error);
        res.status(500).json({ message: 'Error fetching listing' });
    }
});

// Get energy sources for filtering
router.get('/energy-sources', async (req, res) => {
    try {
        const energySources = await Listing.distinct('energySource', { isActive: true });
        res.json({ energySources });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching energy sources' });
    }
});

// Get price range for filtering
router.get('/price-range', async (req, res) => {
    try {
        const result = await Listing.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            }
        ]);

        if (result.length > 0) {
            res.json({
                minPrice: result[0].minPrice,
                maxPrice: result[0].maxPrice
            });
        } else {
            res.json({ minPrice: 0, maxPrice: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching price range' });
    }
});

// Get quantity range for filtering
router.get('/quantity-range', async (req, res) => {
    try {
        const result = await Listing.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minQuantity: { $min: '$availableQuantity' },
                    maxQuantity: { $max: '$availableQuantity' }
                }
            }
        ]);

        if (result.length > 0) {
            res.json({
                minQuantity: result[0].minQuantity,
                maxQuantity: result[0].maxQuantity
            });
        } else {
            res.json({ minQuantity: 0, maxQuantity: 0 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quantity range' });
    }
});

// Get featured listings (most recent approved)
router.get('/featured', async (req, res) => {
    try {
        const featuredListings = await Listing.find({ isActive: true })
            .populate('producer', 'name companyName')
            .sort({ certificationDate: -1 })
            .limit(6);

        res.json({ listings: featuredListings });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching featured listings' });
    }
});

// Get marketplace stats
router.get('/stats', async (req, res) => {
    try {
        const totalListings = await Listing.countDocuments({ isActive: true });
        const totalProducers = await Listing.distinct('producer', { isActive: true });
        
        const totalQuantity = await Listing.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, total: { $sum: '$availableQuantity' } } }
        ]);

        const avgPrice = await Listing.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: null, average: { $avg: '$price' } } }
        ]);

        res.json({
            totalListings,
            totalProducers: totalProducers.length,
            totalAvailableQuantity: totalQuantity.length > 0 ? totalQuantity[0].total : 0,
            averagePrice: avgPrice.length > 0 ? Math.round(avgPrice[0].average) : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching marketplace stats' });
    }
});

module.exports = router; 