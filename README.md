# HydrogenCertify 🚀

A comprehensive marketplace platform for trading certified green hydrogen, built with the MERN stack for the 24-hour hackathon challenge.

## 🌟 Project Overview

HydrogenCertify is a blockchain-inspired marketplace that connects green hydrogen producers, certifiers, and buyers. The platform ensures transparency, quality, and sustainability in the hydrogen trading ecosystem through:

- **Producer Certification**: Rigorous application and inspection process
- **Quality Assurance**: Expert certifier review and approval
- **Transparent Trading**: Verified listings with detailed environmental impact data
- **Certificate Generation**: Automated PDF certificates for compliance and reporting
- **Secure Payments**: Razorpay integration for seamless transactions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   MongoDB       │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tailwind CSS  │    │   JWT Auth      │    │   File Storage  │
│   Responsive UI │    │   Role-Based    │    │   Certificates  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### 🔐 Authentication & Authorization
- **Multi-role System**: Producer, Certifier, Buyer
- **JWT-based Security**: Secure token-based authentication
- **Role-based Access Control**: Protected routes and features

### 🏭 Producer Features
- **Certification Application**: Submit detailed plant and production information
- **Document Upload**: Support for multiple file types (PDF, images)
- **Application Tracking**: Real-time status updates
- **Listing Management**: Create and manage hydrogen listings
- **Dashboard Analytics**: Application statistics and performance metrics

### ✅ Certifier Features
- **Application Review**: Comprehensive application assessment
- **Inspection Scheduling**: Plan and manage site visits
- **Approval/Rejection**: Make certification decisions with detailed notes
- **Quality Standards**: Maintain platform quality and compliance

### 🛒 Buyer Features
- **Marketplace Browsing**: Advanced filtering and search
- **Secure Purchases**: Razorpay payment integration
- **Certificate Download**: Official compliance documents
- **Purchase History**: Complete transaction records
- **Environmental Impact**: Detailed sustainability metrics

### 💳 Payment & Transactions
- **Razorpay Integration**: Secure payment processing
- **Transaction Records**: Immutable transaction history
- **Certificate Generation**: Automated PDF creation
- **Refund Management**: Certifier-controlled refund system

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - User notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload handling
- **PDFKit** - PDF generation

### Payment & Security
- **Razorpay** - Payment gateway integration
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Razorpay Account** (for payment processing)
- **Git** (for version control)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Green_hydrogen_trade
```

### 2. Backend Setup
```bash
cd server

# Install dependencies
npm install

# Create environment file
cp config.env.example config.env
# Edit config.env with your credentials

# Create uploads directory
mkdir uploads

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: MongoDB connection

## ⚙️ Configuration

### Environment Variables

Create a `config.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/hydrogencertify
JWT_SECRET=your_super_secret_jwt_key_here
RAZORPAY_KEY_ID=rzp_test_your_test_key_here
RAZORPAY_KEY_SECRET=your_test_secret_here
PORT=5000
```

### MongoDB Setup

1. **Local Installation**:
   ```bash
   # Install MongoDB Community Edition
   # Start MongoDB service
   mongod
   ```

2. **Cloud Database**:
   - Use MongoDB Atlas or similar service
   - Update connection string in config.env

### Razorpay Setup

1. **Create Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Get API Keys**: From dashboard → Settings → API Keys
3. **Update Config**: Add keys to config.env

## 📱 User Roles & Workflows

### 🏭 Producer Workflow
1. **Register** as a producer
2. **Submit Application** with plant details and documents
3. **Wait for Review** by certifiers
4. **Schedule Inspection** when requested
5. **Get Certified** upon approval
6. **Create Listings** for hydrogen sales
7. **Manage Orders** and fulfillments

### ✅ Certifier Workflow
1. **Register** as a certifier
2. **Review Applications** from producers
3. **Schedule Inspections** for qualified applicants
4. **Conduct Reviews** and assessments
5. **Approve/Reject** applications with notes
6. **Monitor Quality** standards

### 🛒 Buyer Workflow
1. **Register** as a buyer
2. **Browse Marketplace** for hydrogen listings
3. **Filter & Search** by price, quantity, energy source
4. **Make Purchases** through secure payments
5. **Download Certificates** for compliance
6. **Track History** of all transactions

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Producer
- `POST /api/producer/apply` - Submit certification
- `GET /api/producer/applications` - View applications
- `POST /api/producer/listings` - Create listings

### Certifier
- `GET /api/certifier/applications` - Review applications
- `POST /api/certifier/applications/:id/approve` - Approve application
- `POST /api/certifier/applications/:id/reject` - Reject application

### Marketplace
- `GET /api/marketplace/listings` - Browse listings
- `GET /api/marketplace/listings/:id` - View listing details

### Payment
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify-payment` - Verify payment

## 🎨 UI Components

### Design System
- **Color Palette**: Dark theme with blue accents
- **Typography**: Inter font family
- **Components**: Reusable, responsive components
- **Animations**: Smooth transitions and hover effects

### Key Components
- **Navigation**: Role-based menu system
- **Forms**: Validation and error handling
- **Tables**: Sortable, filterable data tables
- **Cards**: Information display cards
- **Modals**: Overlay dialogs and forms

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **Role-based Access**: Protected routes and features
- **Input Validation**: Server-side validation
- **File Upload Security**: Type and size restrictions
- **Payment Verification**: Signature verification

## 📊 Database Schema

### Collections
- **Users**: User accounts and profiles
- **Applications**: Producer certification requests
- **Listings**: Hydrogen product listings
- **Transactions**: Purchase and payment records

### Relationships
- Users → Applications (one-to-many)
- Applications → Listings (one-to-one)
- Users → Transactions (one-to-many)
- Listings → Transactions (one-to-many)

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

### API Testing
Use tools like Postman or Insomnia:
1. Import the API collection
2. Set up environment variables
3. Test all endpoints with different user roles

## 🚀 Deployment

### Backend Deployment
1. **Environment Setup**: Configure production environment variables
2. **Database**: Use production MongoDB instance
3. **File Storage**: Consider cloud storage (AWS S3, GCS)
4. **SSL**: Enable HTTPS
5. **Process Manager**: Use PM2 or similar

### Frontend Deployment
1. **Build**: `npm run build`
2. **Hosting**: Deploy to Vercel, Netlify, or similar
3. **Environment**: Update API endpoints
4. **CDN**: Enable content delivery network

## 📈 Performance Optimization

### Backend
- **Database Indexing**: Optimize query performance
- **Caching**: Implement Redis for session storage
- **Compression**: Enable gzip compression
- **Rate Limiting**: Prevent API abuse

### Frontend
- **Code Splitting**: Lazy load components
- **Image Optimization**: Compress and optimize images
- **Bundle Analysis**: Monitor bundle size
- **Lazy Loading**: Implement virtual scrolling for large lists

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection**
   - Check connection string
   - Verify MongoDB service is running
   - Check network connectivity

2. **Payment Issues**
   - Verify Razorpay credentials
   - Check webhook configurations
   - Test with sandbox mode

3. **File Uploads**
   - Check uploads directory permissions
   - Verify file size limits
   - Check file type restrictions

4. **Authentication**
   - Verify JWT secret
   - Check token expiration
   - Verify role permissions

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Development Guidelines
- Follow existing code style
- Add proper error handling
- Include tests for new features
- Update documentation
- Ensure responsive design

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MERN Stack Community** for excellent documentation
- **Tailwind CSS** for the amazing utility-first framework
- **Razorpay** for payment integration
- **Hackathon Organizers** for the challenge opportunity

## 📞 Support

- **Documentation**: Check the README files in each directory
- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open discussions for help
- **Email**: support@hydrogencertify.com

---

**Built with ❤️ for the 24-hour hackathon challenge**

*HydrogenCertify - Empowering the Green Hydrogen Economy* 