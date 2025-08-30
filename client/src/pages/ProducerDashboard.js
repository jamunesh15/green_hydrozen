import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProducerDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch producer applications
        const applicationsRes = await axios.get('/api/producer/applications');
        if (Array.isArray(applicationsRes.data)) {
          setApplications(applicationsRes.data);
        } else if (applicationsRes.data && Array.isArray(applicationsRes.data.applications)) {
          setApplications(applicationsRes.data.applications);
        } else {
          console.error('API did not return applications as an array:', applicationsRes.data);
          setApplications([]);
        }

        // Fetch producer listings
        const listingsRes = await axios.get('/api/producer/listings');
        if (Array.isArray(listingsRes.data)) {
          setListings(listingsRes.data);
        } else if (listingsRes.data && Array.isArray(listingsRes.data.listings)) {
          setListings(listingsRes.data.listings);
        } else {
          console.error('API did not return listings as an array:', listingsRes.data);
          setListings([]);
        }
      } catch (error) {
        toast.error('Failed to load producer data');
        console.error('Error fetching producer data:', error);
        setApplications([]);
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'in-review': 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Producer Dashboard</h1>
          <p className="text-gray-400">Manage your hydrogen production applications and listings</p>
        </header>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/producer/apply" 
            className="bg-primary hover:bg-primary-dark text-white p-6 rounded-xl flex items-center justify-center text-lg font-medium transition"
          >
            + Submit New Application
          </Link>
          <Link 
            to="/producer/create-listing" 
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-xl flex items-center justify-center text-lg font-medium transition"
          >
            + Create New Listing
          </Link>
          <button 
            className="bg-darksec hover:bg-gray-700 text-white p-6 rounded-xl flex items-center justify-center text-lg font-medium transition"
            onClick={() => toast.success('Monthly reports feature coming soon!')}
          >
            Generate Monthly Reports
          </button>
        </div>

        {/* Applications Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="bg-darksec p-8 rounded-xl text-center">
              <p className="text-lg mb-4">You haven't submitted any applications yet</p>
              <Link 
                to="/producer/apply" 
                className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
              >
                Submit Your First Application
              </Link>
            </div>
          ) : (
            <div className="bg-darksec rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Facility</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Capacity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applications.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app._id.slice(0, 8)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.facilityName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.productionType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{app.productionCapacity} kg/year</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Listings Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Active Listings</h2>
          </div>
          
          {listings.length === 0 ? (
            <div className="bg-darksec p-8 rounded-xl text-center">
              <p className="text-lg mb-2">No active listings</p>
              <p className="text-gray-400 mb-4">Once your application is approved, you can create listings to sell your certified hydrogen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing._id} className="bg-darksec rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{listing.title}</h3>
                    <div className="flex items-center mb-4">
                      <span className="text-2xl font-bold text-primary">${listing.pricePerKg}</span>
                      <span className="text-gray-400 ml-2">per kg</span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Available</span>
                        <span>{listing.availableQuantity} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Production Method</span>
                        <span>{listing.productionMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Carbon Intensity</span>
                        <span>{listing.carbonIntensity} g CO2eq/MJ</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <Link 
                        to={`/marketplace/${listing._id}`}
                        className="text-primary hover:text-primary-light font-medium"
                      >
                        View Listing Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProducerDashboard;
