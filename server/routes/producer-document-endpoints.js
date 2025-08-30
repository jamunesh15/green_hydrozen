// Route to add documents to an existing application
router.post('/application/:id/documents', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { id } = req.params;
        const { documents } = req.body;
        
        if (!documents || !Array.isArray(documents)) {
            return res.status(400).json({ message: 'Documents array is required' });
        }
        
        // Find the application
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user owns this application
        if (application.producer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this application' });
        }
        
        // Add new documents to the application
        application.documents.push(...documents);
        
        // Update the application
        await application.save();
        
        res.status(200).json({
            message: 'Documents added successfully',
            application
        });
        
    } catch (error) {
        console.error('Error adding documents:', error);
        res.status(500).json({ message: 'Error adding documents to application' });
    }
});

// Route to remove a document from an application
router.delete('/application/:id/documents/:documentId', auth, requireRole(['producer']), async (req, res) => {
    try {
        const { id, documentId } = req.params;
        
        // Find the application
        const application = await Application.findById(id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        
        // Check if user owns this application
        if (application.producer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this application' });
        }
        
        // Find the document in the application
        const documentIndex = application.documents.findIndex(doc => doc._id.toString() === documentId);
        
        if (documentIndex === -1) {
            return res.status(404).json({ message: 'Document not found in this application' });
        }
        
        // Get document details for Cloudinary deletion
        const document = application.documents[documentIndex];
        
        // Remove the document from the application
        application.documents.splice(documentIndex, 1);
        await application.save();
        
        res.status(200).json({
            message: 'Document removed successfully',
            application
        });
        
    } catch (error) {
        console.error('Error removing document:', error);
        res.status(500).json({ message: 'Error removing document from application' });
    }
});
