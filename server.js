const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const folderRoutes = require('./routes/folders');
const imageRoutes = require('./routes/images');
const path = require('path');

require('dotenv').config();

console.log('Starting server...');
const app = express();

// Connect to MongoDB
console.log('Connecting to MongoDB...');
connectDB();

app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://your-netlify-app-name.netlify.app', // Replace with your actual Netlify domain
      'https://imageuploader-frontend.netlify.app', // Example - replace with your actual domain
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));


app.use(express.json());
app.use('/uploads', express.static('uploads'));



// Routes
app.use('/api/auth', authRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/images', imageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});