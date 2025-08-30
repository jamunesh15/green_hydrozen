import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ApplicationForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    onDrop: acceptedFiles => {
      // In a real app, you'd upload these files to your server
      const newFiles = acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }));
      
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  });

  const onSubmit = async (data) => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one supporting document');
      return;
    }

    setUploading(true);

    try {
      // In a real app, you would upload files first and get URLs back
      const documentUrls = uploadedFiles.map(file => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        url: URL.createObjectURL(file)
      }));

      // Check if user exists and has necessary properties
      if (!user || !user._id) {
        throw new Error('User information is missing. Please log in again.');
      }
      
      // Format data to match what the server expects
      const companyDetails = {
        name: data.facilityName,
        location: data.location
      };
      
      const plantDetails = {
        productionType: data.productionType,
        productionCapacity: data.productionCapacity
      };
      
      const productionDetails = {
        energySource: data.energySource,
        carbonIntensity: data.carbonIntensity,
        waterConsumption: data.waterConsumption,
        notes: data.notes || ''
      };
      
      // Then submit the form with document URLs
      console.log('Submitting application to server...');
      const response = await axios.post('/api/producer/apply-json', {
        companyDetails,
        plantDetails,
        productionDetails,
        documents: documentUrls,
        producerId: user._id,
        producerName: user.name || 'Unknown Producer'
      });

      console.log('Server response:', response.data);
      toast.success('Application submitted successfully');
      reset();
      setUploadedFiles([]);
      navigate('/producer');
    } catch (error) {
      // Check if it's our custom error about missing user info
      if (error.message && error.message.includes('User information is missing')) {
        toast.error(error.message);
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to the server. Please make sure the server is running.');
        console.error('Network error - cannot connect to server. Is the server running on port 4000?');
      } else {
        toast.error(`Failed to submit application: ${error.message}`);
      }
      console.error('Error submitting application:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkbg text-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hydrogen Production Application</h1>
          <p className="text-gray-400">Complete this form to certify your hydrogen production facility</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Facility Information Section */}
          <div className="bg-darksec rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Facility Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Facility Name *</label>
                <input
                  type="text"
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.facilityName ? 'border border-red-500' : ''}`}
                  placeholder="Enter facility name"
                  {...register('facilityName', { required: 'Facility name is required' })}
                />
                {errors.facilityName && <p className="text-red-500 text-sm mt-1">{errors.facilityName.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Location *</label>
                <input
                  type="text"
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.location ? 'border border-red-500' : ''}`}
                  placeholder="City, Country"
                  {...register('location', { required: 'Location is required' })}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Production Type *</label>
                <select
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.productionType ? 'border border-red-500' : ''}`}
                  {...register('productionType', { required: 'Production type is required' })}
                >
                  <option value="">Select production type</option>
                  <option value="green">Green Hydrogen</option>
                  <option value="blue">Blue Hydrogen</option>
                  <option value="pink">Pink Hydrogen</option>
                  <option value="turquoise">Turquoise Hydrogen</option>
                </select>
                {errors.productionType && <p className="text-red-500 text-sm mt-1">{errors.productionType.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Production Capacity (kg/year) *</label>
                <input
                  type="number"
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.productionCapacity ? 'border border-red-500' : ''}`}
                  placeholder="Annual production capacity"
                  {...register('productionCapacity', { 
                    required: 'Production capacity is required',
                    min: { value: 1, message: 'Must be greater than 0' }
                  })}
                />
                {errors.productionCapacity && <p className="text-red-500 text-sm mt-1">{errors.productionCapacity.message}</p>}
              </div>
            </div>
          </div>

          {/* Environmental Impact Section */}
          <div className="bg-darksec rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Environmental Impact</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Energy Source *</label>
                <select
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.energySource ? 'border border-red-500' : ''}`}
                  {...register('energySource', { required: 'Energy source is required' })}
                >
                  <option value="">Select energy source</option>
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                  <option value="hydro">Hydroelectric</option>
                  <option value="nuclear">Nuclear</option>
                  <option value="biomass">Biomass</option>
                  <option value="natural_gas">Natural Gas</option>
                  <option value="grid">Grid Electricity</option>
                </select>
                {errors.energySource && <p className="text-red-500 text-sm mt-1">{errors.energySource.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Carbon Intensity (g CO2eq/MJ) *</label>
                <input
                  type="number"
                  step="0.01"
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.carbonIntensity ? 'border border-red-500' : ''}`}
                  placeholder="Carbon intensity"
                  {...register('carbonIntensity', { 
                    required: 'Carbon intensity is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
                {errors.carbonIntensity && <p className="text-red-500 text-sm mt-1">{errors.carbonIntensity.message}</p>}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Water Consumption (L/kg H₂) *</label>
                <input
                  type="number"
                  step="0.01"
                  className={`bg-gray-700 rounded-lg px-4 py-3 w-full ${errors.waterConsumption ? 'border border-red-500' : ''}`}
                  placeholder="Water consumption"
                  {...register('waterConsumption', { 
                    required: 'Water consumption is required',
                    min: { value: 0, message: 'Must be 0 or greater' }
                  })}
                />
                {errors.waterConsumption && <p className="text-red-500 text-sm mt-1">{errors.waterConsumption.message}</p>}
              </div>
            </div>
          </div>

          {/* Documentation Section */}
          <div className="bg-darksec rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Supporting Documentation</h2>
            
            <div {...getRootProps({ className: 'cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-6 mb-6 hover:border-primary transition' })}>
              <input {...getInputProps()} />
              <div className="text-center">
                <p className="text-lg mb-2">Drop files here or click to upload</p>
                <p className="text-gray-400 text-sm">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Uploaded Files:</h3>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="bg-gray-700 rounded-lg px-4 py-2 flex justify-between items-center">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))}
                        className="text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Additional Notes Section */}
          <div className="bg-darksec rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6">Additional Notes</h2>
            
            <div>
              <label className="block text-gray-400 text-sm mb-1">Notes (Optional)</label>
              <textarea
                className="bg-gray-700 rounded-lg px-4 py-3 w-full h-32 resize-none"
                placeholder="Any additional information about your hydrogen production facility..."
                {...register('notes')}
              ></textarea>
            </div>
          </div>

          {/* Submit Section */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/producer')}
              className="px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white transition flex items-center"
            >
              {uploading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
