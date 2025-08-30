import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ProducerDashboard from './pages/ProducerDashboard';
import CertifierDashboard from './pages/CertifierDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import Checkout from './pages/Checkout';
import PaymentStatus from './pages/PaymentStatus';
import ApplicationForm from './pages/ApplicationForm';
import CreateListing from './pages/CreateListing';
import CloudinaryTestPage from './pages/CloudinaryTestPage';
import CloudinaryTest from './pages/CloudinaryTest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Producer Routes */}
            <Route 
              path="/producer" 
              element={
                <ProtectedRoute allowedRoles={['producer']}>
                  <ProducerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/producer/apply" 
              element={
                <ProtectedRoute allowedRoles={['producer']}>
                  <ApplicationForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/producer/create-listing" 
              element={
                <ProtectedRoute allowedRoles={['producer']}>
                  <CreateListing />
                </ProtectedRoute>
              } 
            />
            
            {/* Certifier Routes */}
            <Route 
              path="/certifier" 
              element={
                <ProtectedRoute allowedRoles={['certifier']}>
                  <CertifierDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Buyer Routes */}
            <Route 
              path="/buyer" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Marketplace Routes */}
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<ListingDetail />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/status" 
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <PaymentStatus />
                </ProtectedRoute>
              } 
            />
            
            {/* Test Routes */}
            <Route 
              path="/test/cloudinary" 
              element={
                <ProtectedRoute allowedRoles={['producer', 'certifier', 'buyer']}>
                  <CloudinaryTestPage />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/test/cloudinary-direct" element={<CloudinaryTest />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 