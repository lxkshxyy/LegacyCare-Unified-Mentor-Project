const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    type: { type: String, enum: ['pre-booking', 'execution'], default: 'pre-booking' },
    message: { type: String, trim: true, maxlength: 1000 },
    preferredDate: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    providerNote: { type: String, trim: true },
    history: [{ status: String, note: String, at: { type: Date, default: Date.now }, _id: false }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
