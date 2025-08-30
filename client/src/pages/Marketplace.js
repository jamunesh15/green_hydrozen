import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiConnector } from '../services/apiConnector';
import { marketplaceEndpoints } from '../services/apis';
import RupeePrice from '../components/RupeePrice';

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWatchlist, setShowWatchlist] = useState(false);
  
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minQuantity: '',
    productionMethod: '',
    maxCarbonIntensity: ''
  });

  useEffect(() => {
    fetchListings();
    fetchWatchlist();
  }, []);
  
  const fetchWatchlist = async () => {
    try {
      const result = await apiConnector(
        "GET",
        marketplaceEndpoints.GET_WATCHLIST_API,
        null,
        {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      );
      
      if (result.data && Array.isArray(result.data.watchlist)) {
        setWatchlist(result.data.watchlist);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const handleAddToWatchlist = async (listingId) => {
    try {
      const result = await apiConnector(
        "POST",
        marketplaceEndpoints.ADD_TO_WATCHLIST_API,
        { listingId },
        {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      );
      
      if (result.data && result.data.success) {
        toast.success('Added to watchlist');
        // Refresh watchlist after adding
        fetchWatchlist();
      } else {
        toast.error(result.data?.message || 'Failed to add to watchlist');
      }
    } catch (error) {
      toast.error('Failed to add to watchlist');
      console.error('Error adding to watchlist:', error);
    }
  };
  
  const handlePurchase = (listing) => {
    // Navigate to checkout page with listing details
    navigate('/checkout', { state: { listing } });
  };
  
  const fetchListings = async () => {
    try {
      setLoading(true);
      const result = await apiConnector(
        "GET",
        marketplaceEndpoints.GET_LISTINGS_API,
        null,
        null,
        null
      );

      // Make sure result.data is an array
      if (Array.isArray(result.data)) {
        // Validate each listing to ensure it has required fields
        const validListings = result.data.map(listing => {
          // If producer is missing, add an empty object to prevent errors
          if (!listing.producer) {
            listing.producer = { name: 'Unknown' };
          }
          return listing;
        });
        setListings(validListings);
      } else if (result.data && Array.isArray(result.data.listings)) {
        // Validate each listing to ensure it has required fields
        const validListings = result.data.listings.map(listing => {
          // If producer is missing, add an empty object to prevent errors
          if (!listing.producer) {
            listing.producer = { name: 'Unknown' };
          }
          return listing;
        });
        setListings(validListings);
      } else {
        console.error('API did not return an array:', result.data);
        setListings([]); // Fallback to empty array
        toast.error('Received invalid data format from server');
      }
    } catch (error) {
      toast.error('Failed to load marketplace listings');
      console.error('Error fetching listings:', error);
      setListings([]); // Ensure listings is an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Build query parameters from filters
      const queryParams = {};
      
      if (filters.minPrice) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice) queryParams.maxPrice = filters.maxPrice;
      if (filters.minQuantity) queryParams.minQuantity = filters.minQuantity;
      if (filters.productionMethod) queryParams.productionMethod = filters.productionMethod;
      if (filters.maxCarbonIntensity) queryParams.maxCarbonIntensity = filters.maxCarbonIntensity;
      
      // Make API call with filters
      const result = await apiConnector(
        "GET",
        marketplaceEndpoints.GET_LISTINGS_API,
        null,
        null,
        queryParams
      );
      
      if (Array.isArray(result.data)) {
        setListings(result.data);
      } else if (result.data && Array.isArray(result.data.listings)) {
        setListings(result.data.listings);
      } else {
        console.error('API did not return an array:', result.data);
        setListings([]);
      }
      
      toast.success('Filters applied');
    } catch (error) {
      toast.error('Failed to apply filters');
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg text-gray-200 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hydrogen Marketplace</h1>
          <p className="text-gray-400">Browse and purchase certified green hydrogen</p>
          
          <div className="flex mt-4">
            <button 
              onClick={() => setShowWatchlist(false)} 
              className={`px-4 py-2 mr-2 rounded-lg ${!showWatchlist ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              All Listings
            </button>
            <button 
              onClick={() => setShowWatchlist(true)}
              className={`px-4 py-2 rounded-lg ${showWatchlist ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              My Watchlist
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-darksec rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div className="mb-4">
                  <button 
                    onClick={fetchListings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                  >
                    Refresh Listings
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Price Range (₹/kg)</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-1/2 bg-gray-700 rounded-lg px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-1/2 bg-gray-700 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Min Quantity (kg)</label>
                  <input
                    type="number"
                    name="minQuantity"
                    value={filters.minQuantity}
                    onChange={handleFilterChange}
                    placeholder="Minimum quantity"
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Production Method</label>
                  <select
                    name="productionMethod"
                    value={filters.productionMethod}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">All Methods</option>
                    <option value="electrolysis">Electrolysis</option>
                    <option value="biomass">Biomass Gasification</option>
                    <option value="natural_gas">Natural Gas Reforming</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Max Carbon Intensity (g CO2eq/MJ)</label>
                  <input
                    type="number"
                    name="maxCarbonIntensity"
                    value={filters.maxCarbonIntensity}
                    onChange={handleFilterChange}
                    placeholder="Maximum carbon intensity"
                    className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                
                <button 
                  onClick={applyFilters}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg transition mt-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Listings Grid */}
          <div className="lg:col-span-3">
            {showWatchlist ? (
              watchlist.length === 0 ? (
                <div className="bg-darksec p-8 rounded-xl text-center">
                  <p className="text-lg">Your watchlist is empty</p>
                  <p className="text-gray-400 mt-2">Add listings to your watchlist to track them</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {watchlist.map((item, index) => (
                    <div key={item?._id || `watchlist-item-${index}`} className="bg-darksec rounded-xl overflow-hidden flex flex-col">
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{item?.title || 'Untitled Item'}</h3>
                        <p className="text-gray-400">Added to watchlist</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : listings.length === 0 ? (
              <div className="bg-darksec p-8 rounded-xl text-center">
                <p className="text-lg">No listings available</p>
                <p className="text-gray-400 mt-2">Check back later for new hydrogen listings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div key={listing._id} className="bg-darksec rounded-xl overflow-hidden flex flex-col">
                    <div className="relative">
                      <div className="h-48 bg-gray-700">
                        {listing.image ? (
                          <img 
                            src={listing.image} 
                            alt={listing.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Certified
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-grow">
                      <h3 className="text-xl font-bold mb-2">{listing.title || 'Untitled Listing'}</h3>
                      
                      <div className="flex items-center mb-4">
                        <RupeePrice amount={listing.price || 0} bold size="xl" />
                        <span className="text-gray-400 ml-2">per kg</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Available</span>
                          <span>{listing.availableQuantity || '0'} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method</span>
                          <span>{listing.productionMethod || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Carbon Intensity</span>
                          <span>{listing.carbonIntensity || 'N/A'} g CO2eq/MJ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Producer</span>
                          <span>{listing.producer?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 pt-0 mt-auto">
                      <div className="flex space-x-2 mb-2">
                        <Link 
                          to={`/marketplace/${listing._id}`}
                          className="flex-1 block text-center bg-primary hover:bg-primary-dark text-white py-2 rounded-lg transition"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handlePurchase(listing)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
                        >
                          Purchase
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToWatchlist(listing._id)}
                        className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition"
                      >
                        + Add to Watchlist
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
