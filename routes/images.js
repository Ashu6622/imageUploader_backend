const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const Folder = require('../models/Folder');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { name, folderId } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Image name is required' });
    }

    // Verify folder ownership if folderId is provided
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        owner: req.user._id
      });

      if (!folder) {
        // Delete uploaded file if folder verification fails
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Folder not found' });
      }
    }

    const image = new Image({
      name,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      folder: folderId || null,
      owner: req.user._id,
      url: `/uploads/images/${req.file.filename}`
    });

    await image.save();
    
    res.status(201).json({
      message: 'Image uploaded successfully',
      image
    });
  } catch (error) {
    // Delete uploaded file if database save fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get images
router.get('/', auth, async (req, res) => {
  try {
    const { folderId, search } = req.query;
    
    let query = { owner: req.user._id };
    
    if (folderId) {
      query.folder = folderId;
    } else if (folderId === '') {
      query.folder = null;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const images = await Image.find(query)
      .populate('folder', 'name')
      .sort({ createdAt: -1 });

    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete image
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = `uploads/images/${image.filename}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Image.deleteOne({ _id: req.params.id });
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;