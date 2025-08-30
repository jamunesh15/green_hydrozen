import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`/api/marketplace/listings/${id}`);
        // Check if the data is structured correctly
        if (res.data && res.data.listing) {
          setListing(res.data.listing);
        } else {
          console.error('API returned unexpected format:', res.data);
          toast.error('Invalid listing data format');
        }
      } catch (error) {
        toast.error('Failed to load listing details');
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    const maxQuantity = listing.availableQuantity || 0;
    
    if (value > 0 && value <= maxQuantity) {
      setQuantity(value);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please log in to make a purchase');
      navigate('/login');
      return;
    }

    if (user.role !== 'buyer') {
      toast.error('Only buyers can make purchases');
      return;
    }

    try {
      const price = listing.price || listing.pricePerKg || 0;
      await axios.post('/api/payment/purchase', {
        listingId: listing._id,
        quantity,
        amount: quantity * price
      });
      
      toast.success('Purchase successful!');
      setShowPurchaseModal(false);
      navigate('/buyer'); // Redirect to buyer dashboard
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
      console.error('Error making purchase:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg text-gray-200 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-darkbg text-gray-200 p-8 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
          <p className="mb-4">The listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center text-gray-400 hover:text-primary mb-6"
        >
          ← Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column - Image & Details */}
          <div>
            <div className="bg-darksec rounded-xl overflow-hidden mb-6">
              <div className="h-96 bg-gray-700">
                {listing.image ? (
                  <img 
                    src={listing.image} 
                    alt={listing.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            <div className="bg-darksec rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Production Details</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Production Method</h3>
                  <p className="font-medium">{listing.productionMethod || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Energy Source</h3>
                  <p className="font-medium">{listing.energySource || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Carbon Intensity</h3>
                  <p className="font-medium">{listing.carbonIntensity ? `${listing.carbonIntensity} g CO2eq/MJ` : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Water Consumption</h3>
                  <p className="font-medium">{listing.waterConsumption ? `${listing.waterConsumption} L/kg` : 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Facility Location</h3>
                  <p className="font-medium">
                    {listing.location ? 
                      (typeof listing.location === 'string' ? listing.location : 
                       (listing.location.city && listing.location.country ? `${listing.location.city}, ${listing.location.country}` : 'Not specified')) 
                      : 'Not specified'}
                  </p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Certification Date</h3>
                  <p className="font-medium">{listing.certificationDate ? new Date(listing.certificationDate).toLocaleDateString() : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Purchase Info */}
          <div>
            <div className="bg-darksec rounded-xl p-8 mb-6">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              
              <div className="flex items-center mb-6">
                <span className="mr-2 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Certified
                </span>
                <span className="text-gray-400">
                  Produced by <span className="font-medium">
                    {listing.producer && (listing.producer.name || listing.producer.companyName || 'Unknown Producer')}
                  </span>
                </span>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-3xl font-bold text-primary">₹{listing.price || 0}</span>
                  <span className="text-gray-400 ml-2">per kg</span>
                </div>
                <p className="text-gray-400">
                  {(listing.availableQuantity || 0).toLocaleString()} kg available for purchase
                </p>
              </div>
              
              <div className="mb-8">
                <label className="block text-gray-400 text-sm mb-2">Quantity (kg)</label>
                <input
                  type="number"
                  min="1"
                  max={listing.availableQuantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="bg-gray-700 rounded-lg px-4 py-3 w-full mb-2"
                />
                <div className="flex justify-between text-sm">
                  <span>Min: 1 kg</span>
                  <span>Max: {listing.availableQuantity} kg</span>
                </div>
              </div>
              
              <div className="mb-6">
                {/* Safe calculations with fallbacks */}
                {(() => {
                  const price = listing.price || listing.pricePerKg || 0;
                  const subtotal = quantity * price;
                  const fee = subtotal * 0.03;
                  const total = subtotal + fee;
                  
                  return (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Subtotal</span>
                        <span>₹{subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700">
                        <span className="text-gray-400">Transaction Fee (3%)</span>
                        <span>₹{fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <button
                onClick={() => setShowPurchaseModal(true)}
                disabled={listing.availableQuantity === 0}
                className={`w-full py-3 rounded-xl text-white font-medium ${
                  listing.availableQuantity === 0
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark transition'
                }`}
              >
                {listing.availableQuantity === 0 ? 'Sold Out' : 'Purchase Now'}
              </button>
            </div>
            
            <div className="bg-darksec rounded-xl p-8">
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <p className="text-gray-300 whitespace-pre-line">
                {listing.description || "No detailed description provided."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4">
          <div className="bg-darksec rounded-xl max-w-md w-full p-8">
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
            <p className="mb-6">
              You are about to purchase {quantity} kg of hydrogen for ₹{(quantity * (listing.price || 0) * 1.03).toLocaleString()}.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="flex-1 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePurchase}
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
