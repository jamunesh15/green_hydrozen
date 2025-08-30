import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiConnector } from '../services/apiConnector';

const FileUploader = ({ 
  category = 'general',
  onUploadSuccess,
  onUploadError,
  multiple = false,
  acceptedFileTypes = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  maxFileSize = 10 // in MB
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { token } = useAuth();

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size should not exceed ${maxFileSize}MB`;
    }
    
    // You can add more validation here if needed
    return null;
  };

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');
    setUploadProgress(0);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      if (multiple) {
        // Add all files for multiple uploads
        Array.from(files).forEach(file => {
          const validationError = validateFile(file);
          if (validationError) throw new Error(validationError);
          formData.append('files', file);
        });
      } else {
        // Add single file
        const file = files[0];
        const validationError = validateFile(file);
        if (validationError) throw new Error(validationError);
        formData.append('file', file);
      }
      
      // Add category
      formData.append('category', category);
      
      // Upload endpoint
      const endpoint = multiple ? '/api/upload/upload-multiple' : '/api/upload/upload';
      
      const response = await apiConnector({
        method: 'POST',
        url: endpoint,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type here, it will be set automatically with the boundary
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      
      // Handle success
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('File upload error:', err);
      setError(err.message || 'Failed to upload file');
      
      if (onUploadError) {
        onUploadError(err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        multiple={multiple}
        className="hidden"
      />
      
      <button
        onClick={triggerFileInput}
        disabled={isUploading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
      >
        {isUploading ? 'Uploading...' : multiple ? 'Upload Files' : 'Upload File'}
      </button>
      
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: `${uploadProgress}%`}}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{uploadProgress}% Uploaded</p>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
    </div>
  );
};

export default FileUploader;
