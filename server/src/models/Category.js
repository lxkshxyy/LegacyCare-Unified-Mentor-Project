const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    kind: { type: String, enum: ['ritual', 'service'], required: true },
    tradition: { type: String, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, kind: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
