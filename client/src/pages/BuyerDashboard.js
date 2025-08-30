import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const BuyerDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch buyer's transactions
        const transactionsRes = await axios.get('/api/buyer/purchases');
        if (Array.isArray(transactionsRes.data)) {
          setTransactions(transactionsRes.data);
        } else if (transactionsRes.data && Array.isArray(transactionsRes.data.transactions)) {
          setTransactions(transactionsRes.data.transactions);
        } else {
          console.error('API did not return transactions as an array:', transactionsRes.data);
          setTransactions([]);
        }
        
        // Fetch buyer's certificates
        const certificatesRes = await axios.get('/api/buyer/certificates');
        if (Array.isArray(certificatesRes.data)) {
          setCertificates(certificatesRes.data);
        } else if (certificatesRes.data && Array.isArray(certificatesRes.data.certificates)) {
          setCertificates(certificatesRes.data.certificates);
        } else {
          console.error('API did not return certificates as an array:', certificatesRes.data);
          setCertificates([]);
        }
      } catch (error) {
        toast.error('Failed to load buyer data');
        console.error('Error fetching buyer data:', error);
        setTransactions([]);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg text-gray-200 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Calculate total amount spent and kg purchased
  const totalSpent = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalPurchased = transactions.reduce((sum, tx) => sum + (tx.quantity || 0), 0);

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buyer Dashboard</h1>
          <p className="text-gray-400">Track your hydrogen purchases and certificates</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-darksec p-6 rounded-xl">
            <h3 className="text-gray-400 font-medium text-sm mb-2">Total Purchases</h3>
            <p className="text-3xl font-bold">{totalPurchased.toLocaleString()} kg</p>
          </div>
          <div className="bg-darksec p-6 rounded-xl">
            <h3 className="text-gray-400 font-medium text-sm mb-2">Total Spent</h3>
            <p className="text-3xl font-bold">${totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-darksec p-6 rounded-xl">
            <h3 className="text-gray-400 font-medium text-sm mb-2">Active Certificates</h3>
            <p className="text-3xl font-bold">{certificates.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Link 
            to="/marketplace" 
            className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl transition"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-700">
          <div className="flex space-x-8">
            <button
              className={`pb-4 font-medium text-lg ${
                activeTab === 'transactions'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('transactions')}
            >
              Purchase History
            </button>
            <button
              className={`pb-4 font-medium text-lg ${
                activeTab === 'certificates'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('certificates')}
            >
              Your Certificates
            </button>
          </div>
        </div>

        {/* Transactions Tab Content */}
        {activeTab === 'transactions' && (
          <div>
            {transactions.length === 0 ? (
              <div className="bg-darksec p-8 rounded-xl text-center">
                <p className="text-lg mb-4">You haven't made any purchases yet</p>
                <Link 
                  to="/marketplace" 
                  className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
                >
                  Browse the Marketplace
                </Link>
              </div>
            ) : (
              <div className="bg-darksec rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Listing</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Producer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transactions.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link 
                              to={`/marketplace/${tx.listing._id}`}
                              className="text-primary hover:text-primary-light"
                            >
                              {tx.listing.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.producer.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.quantity} kg</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">${tx.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab Content */}
        {activeTab === 'certificates' && (
          <div>
            {certificates.length === 0 ? (
              <div className="bg-darksec p-8 rounded-xl text-center">
                <p className="text-lg mb-2">No certificates yet</p>
                <p className="text-gray-400 mb-4">When you purchase certified hydrogen, you'll receive certificates here.</p>
                <Link 
                  to="/marketplace" 
                  className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
                >
                  Purchase Certified Hydrogen
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((cert) => (
                  <div key={cert._id} className="bg-darksec rounded-xl overflow-hidden">
                    <div className="p-1 bg-gradient-to-r from-green-400 to-primary"></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">Certificate #{cert.certificateNumber}</h3>
                          <p className="text-sm text-gray-400">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium">
                          Verified
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div>
                          <label className="block text-gray-400 text-sm">Hydrogen Quantity</label>
                          <p className="font-medium">{cert.quantity} kg</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Production Method</label>
                          <p className="font-medium">{cert.productionMethod}</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Carbon Intensity</label>
                          <p className="font-medium">{cert.carbonIntensity} g CO2eq/MJ</p>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm">Producer</label>
                          <p className="font-medium">{cert.producer.name}</p>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                        <button
                          onClick={() => toast.success('Certificate downloaded')}
                          className="text-primary hover:text-primary-light font-medium"
                        >
                          Download PDF
                        </button>
                        <button
                          onClick={() => toast.success('Certificate shared')}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;
