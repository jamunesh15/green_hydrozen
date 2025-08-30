# HydrogenCertify Server

Backend API for the HydrogenCertify marketplace - a platform for trading certified green hydrogen.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Producer Management**: Application submission, certification process, and listing management
- **Certifier Dashboard**: Review applications, schedule inspections, and approve/reject producers
- **Marketplace**: Browse hydrogen listings with advanced filtering and search
- **Payment Integration**: Razorpay integration for secure transactions
- **Certificate Generation**: Automated PDF certificate generation for purchases and approvals

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **File Uploads**: Multer
- **Payments**: Razorpay
- **PDF Generation**: PDFKit
- **File Storage**: Local file system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Razorpay account (for payment processing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `config.env.example` to `config.env`
   - Update the following variables:
     ```env
     MONGODB_URI=mongodb://localhost:27017/hydrogencertify
     JWT_SECRET=your_super_secret_jwt_key_here
     RAZORPAY_KEY_ID=rzp_test_your_test_key_here
     RAZORPAY_KEY_SECRET=your_test_secret_here
     PORT=5000
     ```

4. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Producer Routes
- `POST /api/producer/apply` - Submit certification application
- `GET /api/producer/applications` - Get producer's applications
- `POST /api/producer/listings` - Create hydrogen listing
- `GET /api/producer/listings` - Get producer's listings
- `GET /api/producer/dashboard` - Get dashboard statistics

### Certifier Routes
- `GET /api/certifier/applications/pending` - Get pending applications
- `POST /api/certifier/applications/:id/schedule` - Schedule inspection
- `POST /api/certifier/applications/:id/approve` - Approve application
- `POST /api/certifier/applications/:id/reject` - Reject application
- `GET /api/certifier/dashboard` - Get dashboard statistics

### Marketplace Routes
- `GET /api/marketplace/listings` - Get hydrogen listings with filters
- `GET /api/marketplace/listings/:id` - Get specific listing details
- `GET /api/marketplace/featured` - Get featured listings
- `GET /api/marketplace/stats` - Get marketplace statistics

### Buyer Routes
- `GET /api/buyer/purchases` - Get purchase history
- `GET /api/buyer/certificates` - Get downloadable certificates
- `GET /api/buyer/dashboard` - Get dashboard statistics

### Payment Routes
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify-payment` - Verify payment and create transaction
- `GET /api/payment/status/:orderId` - Get payment status
- `POST /api/payment/refund/:transactionId` - Process refund

## Database Models

### User
- Basic user information (name, email, password)
- Role-based access (producer, certifier, buyer)
- Company details and contact information

### Application
- Producer certification applications
- Plant and production details
- Document uploads
- Application status tracking

### Listing
- Hydrogen product listings
- Pricing and quantity information
- Certification details
- Producer information

### Transaction
- Purchase transaction records
- Payment details
- Certificate information
- Transaction status

## File Structure

```
server/
├── models/           # Database models
├── routes/           # API route handlers
├── middleware/       # Authentication and authorization
├── utils/            # Utility functions
├── uploads/          # File storage
├── config.env        # Environment variables
├── package.json      # Dependencies
├── server.js         # Main server file
└── README.md         # This file
```

## Security Features

- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- File upload validation
- Payment signature verification

## Payment Flow

1. Buyer selects hydrogen listing
2. System creates Razorpay order
3. Buyer completes payment
4. System verifies payment signature
5. Transaction is recorded
6. Certificate is generated
7. Listing quantity is updated

## Certificate Generation

The system automatically generates PDF certificates for:
- **Producer Certifications**: When applications are approved
- **Purchase Certificates**: After successful hydrogen purchases

Certificates include:
- Transaction details
- Environmental impact information
- QR codes for verification
- Official HydrogenCertify branding

## Development

### Running in Development Mode
```bash
npm run dev
```

### API Testing
Use tools like Postman or Insomnia to test the API endpoints. Make sure to:
1. Register a user first
2. Use the returned JWT token in the Authorization header
3. Test role-based access control

### Database Seeding
You can create test data by:
1. Registering users with different roles
2. Submitting producer applications
3. Approving applications as a certifier
4. Creating listings and making purchases

## Production Deployment

1. **Environment Variables**: Ensure all production environment variables are set
2. **Database**: Use a production MongoDB instance
3. **File Storage**: Consider using cloud storage (AWS S3, Google Cloud Storage)
4. **SSL**: Enable HTTPS for production
5. **Monitoring**: Implement logging and monitoring
6. **Backup**: Set up regular database backups

## Support

For technical support or questions, contact:
- Email: support@hydrogencertify.com
- Documentation: [API Documentation Link]
- Issues: [GitHub Issues Link]

## License

This project is licensed under the MIT License. 