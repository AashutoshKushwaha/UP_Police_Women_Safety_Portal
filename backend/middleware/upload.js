const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, process.env.UPLOAD_PATH || './uploads'),
    filename: (req, file, cb) => {
        // driverID-fieldname-timestamp.ext (driverID comes later for new registration)
        let field = file.fieldname;
        let ext = path.extname(file.originalname);
        let unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user?._id || 'unknown'}-${field}-${unique}${ext}`);
    }
});
const limits = { fileSize: parseInt(process.env.FILE_SIZE_LIMIT) }; // 1MB

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'photo' && !file.mimetype.match(/^image/)) return cb(null, false);
    if (file.fieldname.toLowerCase().includes('doc') && file.mimetype !== 'application/pdf') return cb(null, false);
    cb(null, true);
};

module.exports = multer({ storage, limits, fileFilter });
