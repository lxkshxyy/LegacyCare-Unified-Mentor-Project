const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' },
    subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 150 },
    message: { type: String, required: [true, 'Please describe the issue'], trim: true, maxlength: 2000 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in-review', 'resolved'], default: 'open', index: true },
    resolution: { type: String, trim: true },
    resolvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
