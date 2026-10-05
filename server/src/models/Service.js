const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: ['funeral-agency', 'transport', 'flowers-decoration', 'priest-pandit', 'cremation-burial', 'catering', 'other'],
    },
    description: { type: String, trim: true, maxlength: 1500 },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    priceUnit: { type: String, enum: ['per-service', 'per-km', 'per-hour', 'per-person', 'package'], default: 'per-service' },
    city: { type: String, required: [true, 'City is required'], trim: true },
    traditions: [{ type: String, trim: true }],
    isAvailable: { type: Boolean, default: true },
    availabilityNote: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ category: 1, city: 1, price: 1 });
serviceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', serviceSchema);
