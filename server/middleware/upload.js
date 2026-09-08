const multer = require('multer');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// For images (projects)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/projects',
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

// For the site owner's profile photo.
const profileImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/profile',
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
});

// For CV / Documents.
const cvStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: () => ({
        folder: 'portfolio/cv',
        resource_type: 'raw',
        public_id: `cv_${crypto.randomBytes(16).toString('hex')}`,
    }),
});

const imageFileFilter = (req, file, cb) => {
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
    const isImageExt = file.originalname && /\.(jpg|jpeg|png|webp|gif|svg|avif|heic|bmp)$/i.test(file.originalname);
    if (isImageMime || isImageExt) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPG, PNG, WEBP, etc.) are allowed'), false);
    }
};

// Profile photo upload middleware.
const uploadProfileImage = multer({
    storage: profileImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

// CV upload middleware
const uploadCV = multer({
    storage: cvStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
        }
    },
});

module.exports = {
    uploadImages,
    uploadProfileImage,
    uploadCV,
};