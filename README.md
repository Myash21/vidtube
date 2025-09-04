# vidtube

A YouTube-inspired backend project built with Node.js, Express, and MongoDB.

## Features

- User registration and authentication (JWT-based)
- File uploads (avatar, cover image) via Multer and Cloudinary
- Video, playlist, comment, tweet, like, and subscription models
- RESTful API structure
- Centralized error handling and standardized API responses

## Project Structure

```
src/
  app.js                # Express app setup
  index.js              # Entry point
  constants.js          # Global constants
  db/                   # MongoDB connection
  controllers/          # Route controllers
  middlewares/          # Auth & upload middlewares
  models/               # Mongoose models
  routes/               # Express routes
  utils/                # Utility functions
public/
  temp/                 # Temporary file storage
.env.sample             # Example environment variables
```

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Cloudinary account (for image uploads)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Myash21/vidtube.git
   cd vidtube
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Copy `.env.sample` to `.env` and fill in your environment variables:
   - MongoDB connection string
   - JWT secrets and expiry times
   - Cloudinary credentials

4. Start the server:
   ```sh
   npm run dev
   ```
   or
   ```sh
   npm start
   ```

## API Endpoints

- `POST /api/v1/users/register` — Register a new user (with avatar/cover image upload)
- `POST /api/v1/users/logout` — Logout user (JWT required)
- `GET /api/v1/healthcheck` — Health check endpoint

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

ISC

---