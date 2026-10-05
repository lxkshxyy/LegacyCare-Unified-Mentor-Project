const mongoose = require('mongoose');
const { encryptedString } = require('../utils/crypto');

const opts = { toJSON: { getters: true, virtuals: false }, toObject: { getters: true } };

const nomineeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Nominee name is required'], trim: true },
    email: { type: String, required: [true, 'Nominee email is required'], lowercase: true, trim: true },
    relation: { type: String, trim: true },
    phone: encryptedString(),
    accessGranted: { type: Boolean, default: true },
    addedAt: { type: Date, default: Date.now },
  },
  opts
);

const selectedServiceSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priceAtSelection: { type: Number, min: 0, default: 0 },
    note: { type: String, trim: true },
  },
  { _id: true }
);

const planSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, trim: true, default: 'My Funeral Plan', maxlength: 120 },
    status: { type: String, enum: ['draft', 'finalized'], default: 'draft', index: true },

    // Step 1 – Basics & location
    location: {
      venue: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      notes: { type: String, trim: true },
    },
    disposition: { type: String, enum: ['cremation', 'burial', 'body-donation', 'other', ''], default: '' },

    // Step 2 – Ritual preferences
    ritual: {
      type: { type: String, enum: ['religious', 'non-religious', ''], default: '' },
      tradition: { type: String, trim: true }, // Hindu, Muslim, Christian, Sikh ...
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
      details: { type: String, trim: true },
    },

    // Step 3 – Officiant
    officiant: {
      preference: { type: String, enum: ['pandit', 'priest', 'clergy', 'imam', 'granthi', 'monk', 'celebrant', 'none', ''], default: '' },
      name: { type: String, trim: true },
      contact: { type: String, trim: true },
      notes: { type: String, trim: true },
    },

    // Step 4 – Ceremony instructions (sensitive → encrypted)
    ceremony: {
      music: encryptedString(),
      prayers: encryptedString(),
      customs: encryptedString(),
      dressCode: encryptedString(),
      otherInstructions: encryptedString(),
    },
    personalNotes: encryptedString(),

    // Step 5 – Services & budget
    selectedServices: [selectedServiceSchema],
    budget: {
      estimate: { type: Number, min: 0, default: 0 },
      limit: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
    },

    // Step 6 – Nominees
    nominees: [nomineeSchema],

    // Tracking
    version: { type: Number, default: 1 },
    updateHistory: [{ at: { type: Date, default: Date.now }, summary: String, _id: false }],
    finalizedAt: Date,
  },
  { timestamps: true, ...opts }
);

planSchema.index({ 'nominees.email': 1 });

planSchema.methods.recalculateBudget = function recalculateBudget() {
  this.budget.estimate = (this.selectedServices || []).reduce((sum, s) => sum + (s.priceAtSelection || 0), 0);
};

planSchema.methods.completion = function completion() {
  const checks = [
    !!(this.location && this.location.city),
    !!this.disposition,
    !!(this.ritual && this.ritual.type),
    !!(this.officiant && this.officiant.preference),
    !!(this.ceremony && (this.ceremony.customs || this.ceremony.prayers || this.ceremony.otherInstructions)),
    (this.selectedServices || []).length > 0,
    (this.nominees || []).length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

module.exports = mongoose.model('Plan', planSchema);
