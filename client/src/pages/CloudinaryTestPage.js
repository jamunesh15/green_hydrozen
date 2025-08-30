import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiConnector } from '../services/apiConnector';
import FileUploader from '../components/FileUploader';
import FileViewer from '../components/FileViewer';

const CloudinaryTestPage = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    // Get debug info on component mount
    getDebugInfo();
  }, []);

  const getDebugInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiConnector({
        method: 'GET',
        url: '/api/debug/debug',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDebugInfo(response.data);
    } catch (err) {
      console.error('Debug error:', err);
      setError('Failed to get debug information');
    } finally {
      setLoading(false);
    }
  };

  const testCloudinaryConnection = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiConnector({
        method: 'GET',
        url: '/api/debug/test',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setTestResult(response.data);
    } catch (err) {
      console.error('Test error:', err);
      setError('Failed to test Cloudinary connection');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (data) => {
    console.log('Upload success:', data);
    if (data.file) {
      setUploadedFiles(prev => [...prev, data.file]);
    } else if (data.files) {
      setUploadedFiles(prev => [...prev, ...data.files]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Cloudinary Integration Test</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Cloudinary Configuration</h2>
          
          <button 
            onClick={getDebugInfo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? 'Loading...' : 'Get Configuration'}
          </button>
          
          {debugInfo && (
            <div className="mt-4">
              <p><strong>Cloud Name:</strong> {debugInfo.cloudName}</p>
              <p><strong>Folder Name:</strong> {debugInfo.folderName}</p>
              <p><strong>API Key Exists:</strong> {debugInfo.apiKeyExists ? 'Yes' : 'No'}</p>
              <p><strong>API Secret Exists:</strong> {debugInfo.apiSecretExists ? 'Yes' : 'No'}</p>
              <p><strong>Environment Variables:</strong> {debugInfo.envVariables?.join(', ')}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
          
          <button 
            onClick={testCloudinaryConnection}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4"
          >
            {loading ? 'Testing...' : 'Test Connection'}
          </button>
          
          {testResult && (
            <div className="mt-4">
              <p><strong>Status:</strong> {testResult.success ? 'Connected' : 'Failed'}</p>
              <p><strong>Message:</strong> {testResult.message}</p>
              {testResult.error && <p><strong>Error:</strong> {testResult.error}</p>}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">File Upload Test</h2>
        
        <FileUploader 
          category="test-uploads"
          onUploadSuccess={handleUploadSuccess}
          onUploadError={error => setError(error.message || 'Upload failed')}
        />
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Uploaded Files</h3>
          <FileViewer 
            files={uploadedFiles} 
            showDelete={false}
            downloadable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CloudinaryTestPage;
