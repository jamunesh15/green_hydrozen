import React from 'react';

const FileViewer = ({ 
  files = [],
  onDelete = null,
  showDelete = false,
  downloadable = true
}) => {
  // Function to determine icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) {
      return 'far fa-image';
    } else if (fileType.includes('pdf')) {
      return 'far fa-file-pdf';
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return 'far fa-file-word';
    } else {
      return 'far fa-file';
    }
  };

  // Function to handle file delete
  const handleDelete = (publicId) => {
    if (onDelete) {
      onDelete(publicId);
    }
  };

  // Function to render thumbnail or icon based on file type
  const renderFilePreview = (file) => {
    if (file.fileType.includes('image')) {
      return (
        <div className="h-20 w-20 rounded overflow-hidden bg-gray-100">
          <img 
            src={file.url} 
            alt={file.fileName} 
            className="h-full w-full object-cover"
          />
        </div>
      );
    } else {
      return (
        <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded">
          <i className={`${getFileIcon(file.fileType)} text-2xl text-gray-700`}></i>
        </div>
      );
    }
  };

  if (!files.length) {
    return <p className="text-gray-500">No files to display</p>;
  }

  return (
    <div className="file-viewer">
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <li key={index} className="border rounded-lg p-3 bg-white">
            <div className="flex space-x-3">
              {renderFilePreview(file)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.fileName}
                </p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                
                <div className="mt-2 flex space-x-2">
                  {downloadable && (
                    <a 
                      href={file.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="text-blue-600 hover:underline text-sm flex items-center"
                    >
                      <i className="fas fa-download mr-1"></i>
                      Download
                    </a>
                  )}
                  
                  {showDelete && (
                    <button 
                      onClick={() => handleDelete(file.publicId)}
                      className="text-red-600 hover:underline text-sm flex items-center"
                    >
                      <i className="fas fa-trash-alt mr-1"></i>
                      Delete
                    </button>
                  )}
                  
                  <a 
                    href={file.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline text-sm flex items-center"
                  >
                    <i className="fas fa-external-link-alt mr-1"></i>
                    View
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileViewer;
