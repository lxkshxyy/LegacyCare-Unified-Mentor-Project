const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const fs = require('fs');

// On serverless hosts (Vercel) only /tmp is writable; files there are temporary.
const UPLOAD_DIR = process.env.UPLOAD_DIR
  || (process.env.VERCEL ? '/tmp/legacycare-uploads' : path.join(__dirname, '..', '..', 'uploads'));
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const ALLOWED = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.txt'];

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.includes(ext)) return cb(new ApiError(400, `File type not allowed. Use: ${ALLOWED.join(', ')}`));
    cb(null, true);
  },
});

module.exports = { upload, UPLOAD_DIR };
