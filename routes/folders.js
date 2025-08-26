const express = require('express');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all folders for user
router.get('/', auth, async (req, res) => {
  try {
    const { parentId } = req.query;
    
    const folders = await Folder.find({
      owner: req.user._id,
      parentFolder: parentId || null
    }).sort({ name: 1 });

    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create folder
router.post('/', auth, async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    // Build path
    let path = '/';
    if (parentFolder) {
      const parent = await Folder.findOne({
        _id: parentFolder,
        owner: req.user._id
      });
      
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
      
      path = parent.path === '/' ? `/${parent.name}` : `${parent.path}/${parent.name}`;
    }

    const folder = new Folder({
      name,
      parentFolder: parentFolder || null,
      owner: req.user._id,
      path
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Folder name already exists in this location' });
    } else {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
});

// Get folder by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete folder
router.delete('/:id', auth, async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Check if folder has subfolders or images
    const subfolders = await Folder.find({ parentFolder: folder._id });
    const images = await Image.find({ folder: folder._id });

    if (subfolders.length > 0 || images.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete folder that contains subfolders or images'
      });
    }

    await Folder.deleteOne({ _id: req.params.id });
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;