# Cloudinary Integration Documentation

This document outlines the implementation of Cloudinary for media management in the Green Hydrogen Trade platform.

## Overview

The integration allows producers, buyers, and certifiers to upload, view, and manage documents and images related to hydrogen certification and trading. The implementation includes:

1. **Server-side Cloudinary Utils**: For uploading, deleting, and generating signed URLs
2. **Upload Routes**: Dedicated API endpoints for file management
3. **Application Document Management**: Components for producers to add documents to applications
4. **Certificate Generation**: Updated to include document references
5. **Document Review**: Interface for certifiers to review and approve documents

## Setup

The Cloudinary service is configured with environment variables in `config.env`:

```
CLOUD_NAME=dqrjkv2ox
API_KEY=831438123621523
API_SECRET=lP0Y6eDN9ghv974T2Ae5L5Mk46w
FOLDER_NAME=green-hydrogen-trade
```

## API Endpoints

### Upload Routes

- **POST /api/upload/upload**: Upload a single file
  - Requires auth token
  - Accepts form-data with 'file' field and optional 'category'
  - Returns file URL and public ID

- **POST /api/upload/upload-multiple**: Upload multiple files (max 5)
  - Requires auth token
  - Accepts form-data with 'files' field and optional 'category'
  - Returns array of file URLs and public IDs

- **DELETE /api/upload/delete/:publicId**: Delete a file from Cloudinary
  - Requires auth token
  - Returns success/failure status

### Producer Routes

- **POST /api/producer/application/:id/documents**: Add documents to application
  - Requires producer auth token
  - Accepts array of document objects from Cloudinary uploads

- **DELETE /api/producer/application/:id/documents/:documentId**: Remove document from application
  - Requires producer auth token

### Certifier Routes

- **GET /api/certifier/applications/:id/documents**: Get documents for an application
  - Requires certifier auth token

## Front-end Components

### General Components

- **FileUploader**: React component to upload files to Cloudinary
  - Supports single/multiple file uploads
  - Shows progress bar
  - Configurable file types and size limits

- **FileViewer**: React component to display uploaded files
  - Shows thumbnails for images
  - Icons for documents
  - Download/view options

### Producer Components

- **ApplicationDocumentsManager**: Component for producers to manage application documents
  - Upload multiple documents
  - View existing documents
  - Delete documents

### Certifier Components

- **CertifierDocumentsReview**: Component for certifiers to review documents
  - View documents by category
  - Add review notes
  - Approve/reject application

## Models

The Application model was updated to include:

```javascript
documents: [{
    url: String,
    publicId: String,
    fileName: String,
    fileType: String,
    size: Number,
    category: {
        type: String,
        enum: ['plant-images', 'company-documents', 'certifications', 'process-diagrams', 'other'],
        default: 'other'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
}]
```

## Certificate Generation

The certificate generator now includes document references in generated PDFs, allowing certificates to link to supporting documentation stored in Cloudinary.

## Usage Flow

1. Producer uploads documents through FileUploader component
2. Documents are temporarily stored on server, then uploaded to Cloudinary
3. Document references are added to the application
4. Certifier reviews documents through CertifierDocumentsReview component
5. Upon approval, documents are linked in the generated certificate

## Security Considerations

- All routes are protected with authentication middleware
- Users can only access documents they have permission for
- Temporary files are deleted after upload to Cloudinary
- File type validation prevents upload of potentially harmful files
