import React, { useState } from 'react';
import FileViewer from '../../components/FileViewer';

const CertifierDocumentsReview = ({ 
  applicationId, 
  documents = [], 
  onApprove, 
  onReject 
}) => {
  const [notes, setNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');

  const handleApprove = () => {
    if (onApprove) {
      onApprove(applicationId, notes);
      setReviewStatus('approved');
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(applicationId, notes);
      setReviewStatus('rejected');
    }
  };

  // Group documents by category for better organization
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {});

  return (
    <div className="certifier-documents-review p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Application Documents Review</h3>
      
      {/* Display documents by category */}
      {Object.keys(documentsByCategory).length > 0 ? (
        Object.entries(documentsByCategory).map(([category, docs]) => (
          <div key={category} className="mb-6">
            <h4 className="text-md font-medium mb-2 capitalize">
              {category.replace(/-/g, ' ')}
            </h4>
            <FileViewer 
              files={docs} 
              downloadable={true}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-500">No documents attached to this application</p>
      )}
      
      {/* Review notes textarea */}
      <div className="mt-6">
        <label htmlFor="review-notes" className="block text-sm font-medium text-gray-700 mb-1">
          Review Notes
        </label>
        <textarea
          id="review-notes"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your review notes here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
      
      {/* Approval/Rejection buttons */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleApprove}
          disabled={reviewStatus === 'approved' || reviewStatus === 'rejected'}
          className={`px-4 py-2 rounded-md ${
            reviewStatus === 'approved' 
              ? 'bg-green-200 text-green-800 cursor-not-allowed' 
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {reviewStatus === 'approved' ? 'Approved' : 'Approve Application'}
        </button>
        
        <button
          onClick={handleReject}
          disabled={reviewStatus === 'approved' || reviewStatus === 'rejected'}
          className={`px-4 py-2 rounded-md ${
            reviewStatus === 'rejected' 
              ? 'bg-red-200 text-red-800 cursor-not-allowed' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {reviewStatus === 'rejected' ? 'Rejected' : 'Reject Application'}
        </button>
      </div>
    </div>
  );
};

export default CertifierDocumentsReview;
