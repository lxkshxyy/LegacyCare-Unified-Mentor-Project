const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, trim: true, default: 'Document' },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true, select: false },
    mimeType: String,
    size: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
