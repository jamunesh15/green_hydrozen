# HydrogenCertify Client

Frontend React application for the HydrogenCertify marketplace - a platform for trading certified green hydrogen.

## Features

- **Modern UI/UX**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive components
- **Role-Based Access**: Different dashboards for Producers, Certifiers, and Buyers
- **Real-time Updates**: Live data updates and notifications
- **Payment Integration**: Seamless Razorpay integration
- **Certificate Management**: View and download hydrogen certificates

## Tech Stack

- **Frontend Framework**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Forms**: React Hook Form
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see server README)

## Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
client/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.js          # Main app component
│   ├── App.css         # Main styles
│   └── index.js        # Entry point
├── package.json         # Dependencies
└── tailwind.config.js  # Tailwind configuration
```

## Key Components

### Authentication
- **AuthContext**: Manages user authentication state
- **ProtectedRoute**: Secures routes based on user roles
- **Login/Register**: User authentication forms

### Navigation
- **Navbar**: Main navigation with role-based menu items
- **Responsive Design**: Mobile-friendly navigation

### Pages
- **ProducerDashboard**: Application management and listings
- **CertifierDashboard**: Review and approve applications
- **BuyerDashboard**: Purchase history and certificates
- **Marketplace**: Browse hydrogen listings
- **ApplicationForm**: Submit certification applications

## Styling

The application uses Tailwind CSS with custom color scheme:
- **Primary**: #0ea5e9 (Sky Blue)
- **Dark Background**: #0f172a (Slate 900)
- **Dark Secondary**: #1e293b (Slate 800)

Custom CSS classes are defined in `App.css` for:
- Form styling
- Status badges
- Table layouts
- Modal components
- Certificate previews

## State Management

The application uses React Context API for:
- **Authentication**: User login/logout, role management
- **Global State**: Shared data across components
- **Theme**: Consistent styling and colors

## API Integration

- **Base URL**: Configured to proxy to `http://localhost:5000`
- **Authentication**: JWT tokens in Authorization headers
- **Error Handling**: Centralized error handling with toast notifications

## Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: Uses Tailwind's responsive utilities
- **Touch Friendly**: Optimized for touch interactions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Components
1. Create component in `src/components/`
2. Export as default
3. Import in required pages
4. Add to routing if needed

### Adding New Pages
1. Create page in `src/pages/`
2. Add route in `App.js`
3. Update navigation if needed
4. Add to role-based access control

### Styling Guidelines
- Use Tailwind CSS classes when possible
- Create custom CSS classes in `App.css` for complex styles
- Follow the established color scheme
- Ensure responsive design

## Testing

```bash
npm test
```

## Building for Production

```bash
npm run build
```

The build folder will contain the production-ready application.

## Deployment

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Ensure the backend API is accessible
4. Update environment variables if needed

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - Kill the process or use a different port
   - `PORT=3001 npm start`

2. **Backend connection issues**
   - Ensure backend server is running
   - Check proxy configuration in package.json
   - Verify API endpoints

3. **Build errors**
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all imports are correct

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Ensure responsive design
4. Test on multiple devices
5. Update documentation

## License

This project is licensed under the MIT License. 