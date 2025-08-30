import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { paymentEndpoints } from '../services/apis';
import { formatCurrency, formatDate } from '../utils/helpers';

const PaymentStatus = () => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get transaction data from location state
  const transactionData = location.state?.transaction;
  
  useEffect(() => {
    if (!transactionData) {
      // If no transaction data, redirect to dashboard
      toast.error('Transaction information not found');
      navigate('/buyer');
      return;
    }
    
    setTransaction(transactionData);
    setLoading(false);
  }, [transactionData, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-darkbg text-gray-200 p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-darkbg text-gray-200 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-darksec rounded-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-400">Your transaction has been completed successfully</p>
        </div>
        
        <div className="bg-darksec border border-gray-700 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400">Transaction ID</span>
              <span className="font-medium">{transaction.transactionId}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400">Certificate Number</span>
              <span className="font-medium">{transaction.certificateNumber}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <span className="text-gray-400">Quantity</span>
              <span className="font-medium">{transaction.quantity} kg</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-xl font-bold text-primary">₹{transaction.totalAmount}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-gray-400">
            Your certificate has been generated and is available on your dashboard
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <button
              onClick={() => navigate('/buyer')}
              className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => navigate('/marketplace')}
              className="px-6 py-2 border border-gray-500 hover:border-gray-400 text-gray-300 rounded-lg transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
