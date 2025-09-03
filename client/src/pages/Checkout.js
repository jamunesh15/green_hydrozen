import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { paymentEndpoints } from '../services/apis';
import { loadScript } from '../utils/helpers';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    
    const listing = location.state?.listing;

    // Check for listing and load Razorpay script on mount
    useEffect(() => {
        if (!listing) {
            toast.error('No listing selected. Redirecting to marketplace.');
            navigate('/marketplace');
            return;
        }

        // Load Razorpay script once
        loadScript('https://checkout.razorpay.com/v1/checkout.js')
            .then(() => setScriptLoaded(true))
            .catch(() => toast.error('Failed to load Razorpay SDK. Please try again later.'));
    }, [listing, navigate]);

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value > 0 && value <= (listing?.availableQuantity || 0)) {
            setQuantity(value);
        }
    };

    const handleCreateOrder = async () => {
        if (!listing) {
            toast.error('No listing selected');
            return;
        }

        if (quantity <= 0 || quantity > listing.availableQuantity) {
            toast.error('Invalid quantity');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                paymentEndpoints.CREATE_ORDER_API,
                { listingId: listing._id, quantity },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            setOrderData(response.data);
            displayRazorpay(response.data);
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Error creating order');
        } finally {
            setLoading(false);
        }
    };

    const displayRazorpay = (data) => {
        if (!scriptLoaded || !window.Razorpay) {
            toast.error('Razorpay SDK not loaded. Please try again.');
            return;
        }

        if (!data.keyId) {
            toast.error('Razorpay API key not provided by server');
            return;
        }

        const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency || 'INR',
            name: 'Green Hydrogen Trade',
            description: `Purchase ${data.listing.title}`,
            order_id: data.orderId,
            handler: async function(response) {
                console.log('Razorpay payment successful:', response);
                toast.success('Payment completed! Verifying...');
                
                try {
                    const paymentData = {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        listingId: listing._id,
                        quantity
                    };

                    console.log('Sending verification request with data:', paymentData);
                    
                    const result = await axios.post(
                        paymentEndpoints.VERIFY_PAYMENT_API,
                        paymentData,
                        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                    );

                    console.log('Payment verification response:', result.data);
                    
                    if (result.data && (result.data.success === true || result.data.transaction)) {
                        toast.success('Payment verification successful!');
                        // Create minimal transaction data if not provided
                        const transactionData = result.data.transaction || {
                            id: 'temp-' + Date.now(),
                            totalAmount: listing.price * quantity,
                            quantity: quantity,
                            certificateNumber: 'Processing...'
                        };
                        
                        navigate('/payment/status', { state: { transaction: transactionData } });
                    } else {
                        console.warn('Verification returned without success flag:', result.data);
                        toast.error('Payment verification needs manual review. Please contact support.');
                        // Still navigate to status page
                        navigate('/buyer');
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    console.error('Error response:', error.response?.data);
                    
                   
                    toast.error('Payment recorded but verification failed. Please contact support.');
                    navigate('/buyer');
                }
            },
            prefill: {
                name: localStorage.getItem('userName') || '',
                email: localStorage.getItem('userEmail') || ''
            },
            theme: { color: '#10b981', backdrop_color: 'rgba(0, 0, 0, 0.8)' },
            notes: { address: 'Green Hydrogen Trade, India' },
            method: { netbanking: true, card: true, wallet: true, upi: true }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
    };

    if (!listing) {
        return <div className="text-center p-8 text-white bg-gray-900 rounded-xl">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-gray-100 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-primary">Checkout</h2>
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 text-gray-100">Order Summary</h3>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/2">
                        <div className="mb-4">
                            <span className="block text-gray-400 mb-1">Listing</span>
                            <span className="font-medium text-gray-100">{listing.title}</span>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-400 mb-1">Producer</span>
                            <span className="font-medium text-gray-100">{listing.producer?.name || 'Unknown'}</span>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-400 mb-1">Energy Source</span>
                            <span className="font-medium text-gray-100">{listing.energySource}</span>
                        </div>
                        <div className="mb-4">
                            <span className="block text-gray-400 mb-1">Available Quantity</span>
                            <span className="font-medium text-gray-100">{listing.availableQuantity} {listing.unit}</span>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-400 mb-1" htmlFor="quantity">Quantity</label>
                            <input
                                type="number"
                                id="quantity"
                                min="1"
                                max={listing.availableQuantity}
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="bg-gray-700 border border-gray-600 text-white rounded w-24 py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <span className="ml-2 text-gray-300">{listing.unit}</span>
                        </div>
                    </div>
                    <div className="md:w-1/2 bg-gray-700 p-4 rounded border border-gray-600">
                        <h4 className="font-semibold mb-3 text-gray-200">Price Details</h4>
                        <div className="flex justify-between mb-2 text-gray-300">
                            <span>Price per unit:</span>
                            <span className="text-primary-light">₹{listing.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-300">
                            <span>Quantity:</span>
                            <span>{quantity} {listing.unit}</span>
                        </div>
                        <hr className="my-2 border-gray-600" />
                        <div className="flex justify-between font-semibold text-white">
                            <span>Total Amount:</span>
                            <span className="text-primary-light text-xl">₹{(listing.price * quantity).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button
                    onClick={() => navigate('/marketplace')}
                    className="px-6 py-2 mr-3 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 hover:text-white transition duration-200"
                >
                    Back to Marketplace
                </button>
                <button
                    onClick={handleCreateOrder}
                    disabled={loading || !scriptLoaded}
                    className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
            </div>
        </div>
    );
};  

export default Checkout;