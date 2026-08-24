const multer = require('multer');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// For images (projects)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/projects',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

// For the site owner's profile photo. Kept in its own folder (and without the
// 4:3 project crop) so replacing a headshot can't collide with project images.
const profileImageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'portfolio/profile',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
    },
});

// For CV / Documents. Stored as a `raw` asset (served as-is, not converted) with
// an unguessable random public id, so past CVs — which carry personal data —
// can't be walked from a predictable URL even after they're replaced. The
// resource_type must stay `raw` to match the delete in profileController.
const cvStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: () => ({
        folder: 'portfolio/cv',
        resource_type: 'raw',
        allowed_formats: ['pdf', 'doc', 'docx'],
        public_id: `cv_${crypto.randomBytes(16).toString('hex')}`,
    }),
});

const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// Image upload middleware (for projects)
const uploadImages = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

// Profile photo upload middleware. The profile route used to reuse `uploadCV`,
// whose filter only accepts PDF/DOC/DOCX — so every image upload was rejected.
const uploadProfileImage = multer({
    storage: profileImageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
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