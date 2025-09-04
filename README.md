# VidTube 🎥

> **⚠️ Work in Progress** - This project is currently under active development. Many features are still being implemented.

A YouTube-inspired backend API built with Node.js, Express, and MongoDB. This project aims to provide a comprehensive video sharing platform with social features similar to YouTube.

## 🚧 Current Status

**Phase 1: Foundation (✅ Completed)**
- ✅ Project structure and architecture
- ✅ Database models and relationships
- ✅ User authentication system
- ✅ File upload infrastructure
- ✅ Basic API framework

**Phase 2: Core Features (🚧 In Progress)**
- 🚧 Video management endpoints
- 🚧 Comment system
- 🚧 Like/Unlike functionality
- 🚧 Playlist management
- 🚧 Subscription system

**Phase 3: Advanced Features (📋 Planned)**
- 📋 Search and filtering
- 📋 Video recommendations
- 📋 Analytics and insights
- 📋 Real-time notifications

## ✨ Implemented Features

### 🔐 Authentication & User Management
- JWT-based authentication with access/refresh tokens
- User registration with avatar and cover image uploads
- Secure password hashing with bcrypt
- User logout functionality
- Protected route middleware

### 📁 File Management
- Cloudinary integration for cloud storage
- Multer middleware for local file handling
- Support for multiple file types (images, videos)
- Automatic file cleanup after upload

### 🗄️ Database Models
- **User Model**: Complete user schema with authentication
- **Video Model**: Video content management with pagination
- **Comment Model**: Video commenting system
- **Playlist Model**: Video playlist functionality
- **Like Model**: Universal like system for videos, comments, and tweets
- **Subscription Model**: Channel subscription system
- **Tweet Model**: Social media-style posts

### 🛠️ Infrastructure
- RESTful API structure
- Centralized error handling
- Standardized API responses
- Environment-based configuration
- CORS support
- Request validation

## 🏗️ Project Structure

```
src/
├── app.js                    # Express app configuration
├── index.js                  # Application entry point
├── constants.js              # Global constants
├── controllers/              # Route controllers
│   ├── healthcheck.controllers.js
│   └── user.controllers.js
├── db/
│   └── index.js              # MongoDB connection
├── middlewares/              # Custom middlewares
│   ├── auth.middlewares.js   # JWT authentication
│   └── multer.middlewares.js # File upload handling
├── models/                   # Mongoose schemas
│   ├── user.models.js
│   ├── video.models.js
│   ├── comment.models.js
│   ├── playlist.models.js
│   ├── like.models.js
│   ├── subscription.models.js
│   └── tweet.models.js
├── routes/                   # API routes
│   ├── healthcheck.routes.js
│   └── user.routes.js
└── utils/                    # Utility functions
    ├── apiError.js           # Error handling
    ├── apiResponse.js        # Response formatting
    ├── asyncHandler.js       # Async error wrapper
    └── cloudinary.js         # File upload utilities
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Myash21/vidtube.git
   cd vidtube
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   mongodb_url=mongodb://localhost:27017
   
   # JWT Configuration
   JWT_SECRET_ACCESS_TOKEN=your_access_token_secret
   JWT_SECRET_REFRESH_TOKEN=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY_TIME=15m
   REFRESH_TOKEN_EXPIRY_TIME=7d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Server Configuration
   PORT=8000
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   or for production:
   ```bash
   npm start
   ```

## 📡 Available API Endpoints

### Health Check
- `GET /api/v1/healthcheck` - Server health status

### User Management
- `POST /api/v1/users/register` - Register new user (with file upload)
- `POST /api/v1/users/logout` - Logout user (JWT required)

### 🚧 Coming Soon
- Video management endpoints
- Comment system endpoints
- Like/Unlike functionality
- Playlist management
- Subscription system
- Search and filtering

## 🛠️ Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary, Multer
- **Security**: bcrypt, CORS
- **Development**: Nodemon, Prettier

## 🤝 Contributing

This project is currently in active development. Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Yash Mhaskar** - [GitHub](https://github.com/Myash21)

---

**Note**: This project is a work in progress. Features and API endpoints are being added regularly. Check back for updates!