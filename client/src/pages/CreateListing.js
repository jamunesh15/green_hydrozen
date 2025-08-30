import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const CreateListing = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    applicationId: '',
    title: '',
    description: '',
    price: '',
    quantity: '',
    availableQuantity: ''
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchApprovedApplications = async () => {
      try {
        // Get only approved applications
        const res = await axios.get('/api/producer/applications', {
          params: { status: 'approved' }
        });
        
        if (res.data && Array.isArray(res.data.applications)) {
          setApplications(res.data.applications);
        } else {
          console.error('API did not return applications as expected:', res.data);
          setApplications([]);
          toast.error('Could not fetch your approved applications');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedApplications();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'applicationId') {
      const selected = applications.find(app => app._id === value);
      setSelectedApplication(selected);
      
      // Pre-fill some fields based on the selected application
      if (selected) {
        setFormData({
          ...formData,
          applicationId: value,
          title: `${selected.productionDetails?.energySource || 'Green'} Hydrogen from ${selected.plantDetails?.address?.city || 'Our Facility'}`,
          quantity: selected.plantDetails?.plantCapacity || '',
          availableQuantity: selected.plantDetails?.plantCapacity || ''
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAvailableQuantityChange = (e) => {
    const value = e.target.value;
    // Ensure available quantity is not more than total quantity
    if (Number(value) > Number(formData.quantity)) {
      toast.error('Available quantity cannot exceed total quantity');
      return;
    }
    setFormData({
      ...formData,
      availableQuantity: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.applicationId) {
      toast.error('Please select an approved application');
      return;
    }

    try {
      await axios.post('/api/producer/listings', formData);
      toast.success('Listing created successfully');
      navigate('/producer');
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error.response?.data?.message || 'Failed to create listing');
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
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
          <p className="text-gray-400">List your certified hydrogen for sale on the marketplace</p>
        </header>

        {applications.length === 0 ? (
          <div className="bg-darksec p-8 rounded-xl text-center">
            <p className="text-lg mb-4">You don't have any approved applications to create a listing</p>
            <button
              onClick={() => navigate('/producer/apply')}
              className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
            >
              Submit New Application
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-darksec rounded-xl p-8">
            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Select Approved Application
              </label>
              <select
                name="applicationId"
                value={formData.applicationId}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Select Application --</option>
                {applications.map(app => (
                  <option key={app._id} value={app._id}>
                    {app.plantDetails?.address?.city || 'Facility'} - {app.productionDetails?.energySource || 'Green'} Hydrogen
                  </option>
                ))}
              </select>
            </div>

            {selectedApplication && (
              <div className="mb-6 p-4 bg-gray-750 rounded-lg">
                <h3 className="font-medium mb-2">Selected Application Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Energy Source:</span>
                    <p>{selectedApplication.productionDetails?.energySource || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Production Method:</span>
                    <p>{selectedApplication.productionDetails?.productionMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Carbon Intensity:</span>
                    <p>{selectedApplication.productionDetails?.carbonIntensity || 'Not specified'} g CO2eq/MJ</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Renewable %:</span>
                    <p>{selectedApplication.productionDetails?.renewablePercentage || 'Not specified'}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Listing Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Green Hydrogen from Facility Name"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="Describe your hydrogen product, production methods, and other relevant details"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">
                  Price per kg (INR)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="300"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 font-medium">
                  Total Quantity (kg)
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="1000"
                  required
                />
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-300 mb-2 font-medium">
                Available Quantity (kg)
              </label>
              <input
                type="number"
                name="availableQuantity"
                value={formData.availableQuantity}
                onChange={handleAvailableQuantityChange}
                min="1"
                max={formData.quantity}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="1000"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                This is the amount that will be available for purchase
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/producer/dashboard')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
              >
                Create Listing
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
