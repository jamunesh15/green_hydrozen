import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CloudinaryTest = () => {
  const [status, setStatus] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkCloudinaryStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/cloudinary-test/cloudinary-status');
      setStatus(response.data);
    } catch (err) {
      console.error('Error checking Cloudinary status:', err);
      setError(err.response?.data?.message || 'Failed to check Cloudinary status');
    } finally {
      setLoading(false);
    }
  };

  const testUpload = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/cloudinary-test/test-upload');
      setUploadResult(response.data);
    } catch (err) {
      console.error('Error testing upload:', err);
      setError(err.response?.data?.message || 'Failed to test upload');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check status when component mounts
    checkCloudinaryStatus();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Direct Test</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Cloudinary Status</h2>
          
          <button 
            onClick={checkCloudinaryStatus}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </button>
          
          {status && (
            <div className="mt-4">
              <p><strong>Success:</strong> {status.success ? 'Yes' : 'No'}</p>
              <p><strong>Message:</strong> {status.message}</p>
              {status.config && (
                <>
                  <p><strong>Cloud Name:</strong> {status.config.cloudName}</p>
                  <p><strong>API Key Exists:</strong> {status.config.apiKeyExists ? 'Yes' : 'No'}</p>
                  <p><strong>API Secret Exists:</strong> {status.config.apiSecretExists ? 'Yes' : 'No'}</p>
                  <p><strong>Folder Name:</strong> {status.config.folderName}</p>
                </>
              )}
              {status.error && <p><strong>Error:</strong> {status.error}</p>}
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Test Upload</h2>
          
          <button 
            onClick={testUpload}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? 'Uploading...' : 'Test Upload'}
          </button>
          
          {uploadResult && (
            <div className="mt-4">
              <p><strong>Success:</strong> {uploadResult.success ? 'Yes' : 'No'}</p>
              <p><strong>Message:</strong> {uploadResult.message}</p>
              {uploadResult.result && (
                <>
                  <p><strong>URL:</strong> <a href={uploadResult.result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{uploadResult.result.url}</a></p>
                  <p><strong>Public ID:</strong> {uploadResult.result.publicId}</p>
                </>
              )}
              {uploadResult.error && <p><strong>Error:</strong> {uploadResult.error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTest;
