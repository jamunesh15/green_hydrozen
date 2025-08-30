import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaIndustry } from 'react-icons/fa';
import { FaFileSignature, FaCartShopping } from 'react-icons/fa6';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'producer',
    companyName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const user = await register(formData);
      
      // Redirect based on role
      switch (user.role) {
        case 'producer':
          navigate('/producer');
          break;
        case 'certifier':
          navigate('/certifier');
          break;
        case 'buyer':
          navigate('/buyer');
          break;
        default:
          navigate('/marketplace');
      }
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'producer', label: 'Producer', icon: FaIndustry, description: 'Submit applications and sell hydrogen' },
    { value: 'certifier', label: 'Certifier', icon: FaFileSignature, description: 'Review and approve applications' },
    { value: 'buyer', label: 'Buyer', icon: FaCartShopping, description: 'Purchase certified hydrogen' }
  ];

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FaLeaf className="text-4xl text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create Your Account</h1>
            <p className="text-gray-400">Join HydrogenCertify and start your journey</p>
          </div>

          {/* Registration Form */}
          <div className="bg-darksec p-8 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block mb-3 text-sm font-medium">I want to register as a...</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role.value })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.role === role.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <Icon className="text-2xl" />
                          <div className="text-center">
                            <div className="font-semibold">{role.label}</div>
                            <div className="text-xs text-gray-400">{role.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Company Information */}
              {(formData.role === 'producer' || formData.role === 'certifier') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium">Company Name *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              )}

              {/* Address Information */}
              <div>
                <label className="block mb-3 text-sm font-medium">Address</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="Street Address"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="State/Province"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="Country"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                      placeholder="ZIP/Postal Code"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 rounded-lg font-semibold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-6">Benefits of Joining</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaIndustry className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">For Producers</h3>
                <p className="text-sm text-gray-400">Get certified and sell your green hydrogen to verified buyers</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileSignature className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">For Certifiers</h3>
                <p className="text-sm text-gray-400">Help maintain quality standards and grow the green hydrogen market</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCartShopping className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">For Buyers</h3>
                <p className="text-sm text-gray-400">Access certified green hydrogen with transparent pricing and quality</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 