# Image Manager Backend

A Node.js/Express backend API for managing images and folders with user authentication.

## Features

- **User Authentication**: JWT-based registration and login
- **Folder Management**: Create, view, and delete folders with hierarchical structure
- **Image Upload**: Multi-part file upload with folder organization
- **Image Management**: View, search, and delete images
- **Security**: Password hashing with bcrypt, JWT tokens, CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: bcryptjs, CORS

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Folders
- `GET /api/folders` - Get folders (with optional parentId)
- `POST /api/folders` - Create new folder
- `GET /api/folders/:id` - Get specific folder
- `DELETE /api/folders/:id` - Delete folder

### Images
- `POST /api/images/upload` - Upload image
- `GET /api/images` - Get images (with optional folderId and search)
- `DELETE /api/images/:id` - Delete image

## Project Structure

```
backend/
├── config/
│   └── db.js              # MongoDB connection
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── User.js            # User schema
│   ├── Folder.js          # Folder schema
│   └── Image.js           # Image schema
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── folders.js         # Folder management routes
│   └── images.js          # Image management routes
├── uploads/
│   └── images/            # Uploaded image storage
├── .env                   # Environment variables
├── package.json
└── server.js              # Main server file
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and JWT secret

3. **Start the server**:
   ```bash
   npm start
   ```

The server will run on `http://localhost:5000`

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT implementation
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT token authentication with 7-day expiration
- CORS configuration for specific origins
- Protected routes with authentication middleware
- Input validation and error handling

## File Upload

- Images stored in `uploads/images/` directory
- Supported formats: JPG, JPEG, PNG, GIF
- File size limit: 5MB
- Unique filename generation to prevent conflicts

## Database Models

### User
- username (unique, 3-30 characters)
- email (unique, lowercase)
- password (hashed, minimum 6 characters)
- timestamps

### Folder
- name (required)
- parentId (optional, for nested folders)
- userId (owner reference)
- timestamps

### Image
- filename (original name)
- path (storage path)
- folderId (optional, folder reference)
- userId (owner reference)
- timestamps

## Author

Ashutosh Roy