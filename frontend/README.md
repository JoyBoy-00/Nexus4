# Nexus Frontend

A beautiful, modern React frontend for the Nexus networking platform built with Material-UI and Framer Motion.

## Features

- 🎨 **Modern UI Design** - Beautiful, responsive design with Material-UI components
- ✨ **Smooth Animations** - Framer Motion animations for enhanced user experience
- 🔐 **Authentication** - Secure login and registration with JWT tokens
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile devices
- 🎯 **Role-based Access** - Different interfaces for Students, Alumni, and Admins
- 🚀 **Fast Performance** - Optimized with React best practices

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Material-UI (MUI)** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Context API** - State management for authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:3000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Required:
   - `VITE_BACKEND_URL`: Backend API base URL (for example `http://localhost:3000`)

   Optional:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_VAPID_KEY`
   - `VITE_CORS_PROXY`
   - `VITE_DEBUG`

   Note: Firebase variables are optional as a group. If any Firebase variable is set, all Firebase variables must be set.

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── pages/              # Page components
│   │   ├── Login.tsx       # Login page
│   │   ├── Register.tsx    # Registration page
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── Profile.tsx     # User profile
│   │   ├── Connections.tsx # Network connections
│   │   └── Messages.tsx    # Messaging interface
│   ├── App.tsx             # Main app component
│   └── index.tsx           # App entry point
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## Features Overview

### Authentication
- Secure login and registration
- JWT token management
- Protected routes
- Automatic token refresh

### Dashboard
- Overview of network activity
- Quick action buttons
- Recent activity feed
- Statistics cards

### Navigation
- Responsive navigation bar
- Role-based menu items
- User profile dropdown
- Active route highlighting

### Design System
- Consistent color palette
- Typography hierarchy
- Component spacing
- Animation guidelines

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend communicates with the backend API at `http://localhost:3000`. Make sure the backend server is running before using the frontend.

At startup, the app validates required environment variables and fails fast when configuration is invalid.

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Protected Endpoints
All other endpoints require a valid JWT token in the Authorization header.

## Customization

### Theme
The app uses a custom Material-UI theme defined in `App.tsx`. You can modify colors, typography, and component styles there.

### Styling
- Use Material-UI's `sx` prop for component-specific styles
- Follow the established design system
- Use Framer Motion for animations

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Test on multiple screen sizes
5. Ensure accessibility standards

## License

This project is part of the Nexus networking platform.
