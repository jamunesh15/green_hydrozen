import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLeaf, FaIndustry } from 'react-icons/fa';
import { FaFileSignature, FaCartShopping } from 'react-icons/fa6';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'producer'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, formData.role);
      
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
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <FaLeaf className="text-4xl text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-400">Log in to access your dashboard</p>
          </div>

          {/* Login Form */}
          <div className="bg-darksec p-8 rounded-xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block mb-3 text-sm font-medium">I am a...</label>
                <div className="grid grid-cols-1 gap-3">
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
                        <div className="flex items-center space-x-3">
                          <Icon className="text-xl" />
                          <div className="text-left">
                            <div className="font-semibold">{role.label}</div>
                            <div className="text-xs text-gray-400">{role.description}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
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

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-medium">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                  placeholder="Enter your password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary py-3 rounded-lg font-semibold hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-6">Why HydrogenCertify?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaIndustry className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Green Production</h3>
                <p className="text-sm text-gray-400">Certified green hydrogen production with renewable energy</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFileSignature className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Verified Quality</h3>
                <p className="text-sm text-gray-400">Rigorous certification process ensures quality standards</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCartShopping className="text-2xl text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Easy Trading</h3>
                <p className="text-sm text-gray-400">Seamless marketplace for buying and selling hydrogen</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 