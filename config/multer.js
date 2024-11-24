const multer = require('multer');
const path = require('path');

// Configure storage for user images
const userStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/users')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

// Configure storage for business logos
const businessStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/business')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

// Create upload instances
const uploadUserImage = multer({ 
    storage: userStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
});

const uploadBusinessLogo = multer({ 
    storage: businessStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png)'));
    }
});

module.exports = {
    uploadUserImage,
    uploadBusinessLogo
};
