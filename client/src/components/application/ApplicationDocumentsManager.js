import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiConnector } from '../../services/apiConnector';
import FileUploader from '../../components/FileUploader';
import FileViewer from '../../components/FileViewer';

const ApplicationDocumentsManager = ({ applicationId, existingDocuments = [] }) => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState(existingDocuments);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    // Update documents if the prop changes
    setDocuments(existingDocuments);
  }, [existingDocuments]);

  const handleUploadSuccess = (uploadResult) => {
    // For multiple file upload
    if (uploadResult.files) {
      addDocumentsToApplication(uploadResult.files);
    } 
    // For single file upload
    else if (uploadResult.file) {
      addDocumentsToApplication([uploadResult.file]);
    }
  };

  const addDocumentsToApplication = async (newDocuments) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await apiConnector({
        method: 'POST',
        url: `/api/producer/application/${applicationId}/documents`,
        data: { documents: newDocuments },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update the local documents state with new documents
      setDocuments(prev => [...prev, ...newDocuments]);
      setSuccess('Documents added successfully!');
      
    } catch (error) {
      console.error('Error adding documents:', error);
      setError(error.response?.data?.message || 'Failed to add documents to application');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await apiConnector({
        method: 'DELETE',
        url: `/api/producer/application/${applicationId}/documents/${documentId}`,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the document from local state
      setDocuments(documents.filter(doc => doc._id !== documentId));
      setSuccess('Document removed successfully!');
      
    } catch (error) {
      console.error('Error deleting document:', error);
      setError(error.response?.data?.message || 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="application-documents-manager p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Application Documents</h3>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="text-md font-medium mb-2">Upload Documents</h4>
        <FileUploader 
          category="certification-documents" 
          onUploadSuccess={handleUploadSuccess} 
          onUploadError={(err) => setError(err.message || 'Upload failed')}
          multiple={true}
        />
      </div>
      
      <div>
        <h4 className="text-md font-medium mb-2">Uploaded Documents</h4>
        <FileViewer 
          files={documents} 
          onDelete={handleDeleteDocument}
          showDelete={true}
          downloadable={true}
        />
      </div>
    </div>
  );
};

export default ApplicationDocumentsManager;
