# ResumeCraft - Setup Guide

Welcome to ResumeCraft! This is a comprehensive resume builder application built with the MERN stack (MongoDB, Express.js, React, Node.js). This guide will walk you through setting up the project on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ResumeCraft
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Configuration

Copy the environment example file and configure your variables:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# SMTP Configuration (for email functionality)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FROM_NAME=Resume Builder
FROM_EMAIL=your-email@gmail.com

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/resume_builder
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Client Configuration
CLIENT_URL=http://localhost:3000

# File Upload Limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Important Notes:**
- For Gmail, you'll need to generate an "App Password" in your Google Account settings
- Sign up for a free Cloudinary account at [cloudinary.com](https://cloudinary.com) for image upload functionality
- Make sure MongoDB is running on your system

#### Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5001`

### 3. Frontend Setup

Open a new terminal and navigate to the Frontend directory:

```bash
cd Frontend
npm install
```

#### Environment Configuration

Copy the environment example file:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_DOCS_URL=http://localhost:5001/api/docs/

# App Configuration
VITE_APP_NAME=ResumeCraft
VITE_APP_VERSION=1.0.0

# Geolocation APIs (Free Services)
VITE_NOMINATIM_API_URL=https://nominatim.openstreetmap.org
VITE_PHOTON_API_URL=https://photon.komoot.io

# Google Maps APIs (Optional - requires API keys)
VITE_GOOGLE_MAPS_API_KEY=
VITE_GOOGLE_PLACES_API_URL=https://maps.googleapis.com/maps/api/place
VITE_GOOGLE_GEOCODING_API_URL=https://maps.googleapis.com/maps/api/geocode

# Optional APIs (Require API Keys)
VITE_PLACES_API_URL=https://api.opencagedata.com/geocode/v1
VITE_OPENCAGE_API_KEY=
VITE_LOCATIONIQ_API_URL=https://us1.locationiq.com/v1
VITE_LOCATIONIQ_API_KEY=

# CORS Configuration
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Development Configuration
NODE_ENV=development
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🗄️ Database Setup

### MongoDB Configuration

1. **Install MongoDB** (if not already installed):
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow the [official installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**:
   ```bash
   # macOS/Linux
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   ```

3. **Create Database**:
   The application will automatically create the database when it first connects. Make sure your MongoDB instance is running on the default port (27017).

## 🔧 Additional Configuration

### Cloudinary Setup (for Image Uploads)

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Update your `.env` file with the Cloudinary credentials

### Email Configuration (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use this app password in your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start MongoDB** (if not running as a service)
2. **Start Backend**: `cd backend && npm run dev`
3. **Start Frontend**: `cd Frontend && npm run dev`

### Production Build

```bash
# Build the frontend
cd Frontend
npm run build

# Start the backend in production mode
cd backend
npm start
```

## 📚 Available Scripts

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start the development server with auto-restart

### Frontend Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## 🌐 API Documentation

Once the backend is running, you can access the API documentation at:
`http://localhost:5001/api/docs`

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**:
   - Backend: Change the PORT in `.env` file
   - Frontend: The dev server will automatically suggest an alternative port

2. **MongoDB Connection Issues**:
   - Ensure MongoDB is running: `brew services list` (macOS) or `net start MongoDB` (Windows)
   - Check if the connection string in `.env` is correct

3. **CORS Issues**:
   - Make sure the `CLIENT_URL` in backend `.env` matches your frontend URL
   - Check that `VITE_ALLOWED_ORIGINS` includes your frontend URL

4. **Image Upload Issues**:
   - Verify Cloudinary credentials are correct
   - Check file size limits in the `.env` file

### Getting Help

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Make sure MongoDB is running

## 📁 Project Structure

```
ResumeCraft/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads
│   └── utils/              # Utility functions
├── Frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # API integration
│   │   └── config/        # Frontend configuration
│   └── public/            # Static assets
└── Setup.md               # This file
```

## 🎉 You're All Set!

Once both servers are running, you can:
- Access the application at `http://localhost:3000`
- View API documentation at `http://localhost:5001/api/docs`
- Start building resumes with the various templates available

Happy coding! 🚀
