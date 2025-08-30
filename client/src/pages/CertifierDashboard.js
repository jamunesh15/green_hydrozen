import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CertifierDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('/api/certifier/applications');
        if (Array.isArray(res.data)) {
          setApplications(res.data);
        } else if (res.data && Array.isArray(res.data.applications)) {
          setApplications(res.data.applications);
        } else {
          console.error('API did not return applications as an array:', res.data);
          setApplications([]);
          toast.error('Received invalid data format from server');
        }
      } catch (error) {
        toast.error('Failed to load applications');
        console.error('Error fetching applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      // Use the new PATCH endpoint that handles all status changes
      await axios.patch(`/api/certifier/applications/${applicationId}/status`, {
        status: newStatus
      });
      
      // Update the local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status: newStatus } : app
      ));
          
      setSelectedApp(null);
      toast.success(`Application ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update application status');
      console.error('Error updating status:', error);
    }
  };

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
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Certifier Dashboard</h1>
          <p className="text-gray-400">Review and approve hydrogen production applications</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Applications List */}
          <div className="lg:col-span-5">
            <div className="bg-darksec rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-800">
                <h2 className="text-xl font-semibold">Pending Applications</h2>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search applications..."
                    className="w-full bg-gray-700 text-gray-200 px-4 py-2 rounded-lg"
                  />
                </div>
                
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <p>No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div 
                        key={app._id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedApp?._id === app._id 
                            ? 'bg-primary bg-opacity-20 border border-primary' 
                            : 'hover:bg-gray-700'
                        }`}
                        onClick={() => setSelectedApp(app)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">{app.facilityName}</h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <div className="text-sm text-gray-400">
                          <p>ID: {app._id.slice(0, 8)}</p>
                          <p>Producer: {app.producerName}</p>
                          <p>Submitted: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Application Details */}
          <div className="lg:col-span-7">
            {selectedApp ? (
              <div className="bg-darksec rounded-xl overflow-hidden">
                <div className="p-4 bg-gray-800 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Application Details</h2>
                  <StatusBadge status={selectedApp.status} />
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Facility Information</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-400 text-sm">Facility Name</label>
                          <p className="font-medium">{selectedApp.facilityName}</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Location</label>
                          <p className="font-medium">{selectedApp.location}</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Production Type</label>
                          <p className="font-medium">{selectedApp.productionType}</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Production Capacity</label>
                          <p className="font-medium">{selectedApp.productionCapacity} kg/year</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Environmental Impact</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-gray-400 text-sm">Energy Source</label>
                          <p className="font-medium">{selectedApp.energySource}</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Carbon Intensity</label>
                          <p className="font-medium">{selectedApp.carbonIntensity} g CO2eq/MJ</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Water Consumption</label>
                          <p className="font-medium">{selectedApp.waterConsumption} L/kg H₂</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Documentation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApp.documents?.map((doc, index) => (
                        <a 
                          key={index} 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                        >
                          <div className="bg-gray-800 p-2 rounded mr-3">
                            <span className="text-primary">PDF</span>
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-400">{doc.size}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Additional Notes</h3>
                    <p className="bg-gray-700 p-4 rounded-lg text-gray-300">
                      {selectedApp.notes || "No additional notes provided."}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'rejected')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedApp._id, 'approved')}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
                    >
                      Approve Application
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-darksec rounded-xl p-8 h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl mb-2">Select an application to review</p>
                  <p className="text-gray-400">Click on an application from the list to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertifierDashboard;
