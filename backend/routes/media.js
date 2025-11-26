const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Cloudinary setup (only used in production)
let cloudinary = null;
const USE_CLOUDINARY = process.env.CLOUDINARY_URL ? true : false;

if (USE_CLOUDINARY) {
  cloudinary = require('cloudinary').v2;
  // Cloudinary URL format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
  // Railway/Render will set this automatically if you add Cloudinary
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Allowed extensions
  const allowedImages = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const allowedVideos = ['.mp4', '.webm', '.mov', '.avi'];
  const allowedAudio = ['.mp3', '.wav', '.ogg', '.m4a'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const allAllowed = [...allowedImages, ...allowedVideos, ...allowedAudio];
  
  if (allAllowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext} not allowed. Allowed types: ${allAllowed.join(', ')}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
});

// Helper function to determine media type from file extension
const getMediaType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) return 'image';
  if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) return 'video';
  if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
  return 'unknown';
};

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (filePath, mediaType) => {
  try {
    const options = {
      folder: 'scavenger-hunt',
      resource_type: mediaType === 'video' ? 'video' : (mediaType === 'audio' ? 'video' : 'image')
    };
    
    const result = await cloudinary.uploader.upload(filePath, options);
    
    // Delete local file after successful upload
    fs.unlinkSync(filePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload single file endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mediaType = getMediaType(req.file.filename);
    let fileUrl;

    if (USE_CLOUDINARY) {
      // Production: Upload to Cloudinary
      console.log('Uploading to Cloudinary...');
      fileUrl = await uploadToCloudinary(req.file.path, mediaType);
    } else {
      // Development: Use local filesystem
      // URL will be served by /api/media/uploads/:filename
      fileUrl = `/api/media/uploads/${req.file.filename}`;
    }

    res.json({
      success: true,
      url: fileUrl,
      type: mediaType,
      filename: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload file: ' + error.message });
  }
});

// Serve uploaded files (only in development, production uses Cloudinary CDN)
router.get('/uploads/:filename', (req, res) => {
  if (USE_CLOUDINARY) {
    return res.status(404).json({ error: 'Files are served from Cloudinary in production' });
  }

  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  // Security: prevent directory traversal
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

// Delete file endpoint (optional - for cleanup)
router.delete('/uploads/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    if (USE_CLOUDINARY) {
      // Extract public_id from Cloudinary URL and delete
      // This is a simplified version - you might want to store public_ids in DB
      return res.json({ message: 'Cloudinary file deletion not implemented in this example' });
    } else {
      const filePath = path.join(uploadsDir, filename);
      
      if (!filePath.startsWith(uploadsDir)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted' });
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

module.exports = router;
