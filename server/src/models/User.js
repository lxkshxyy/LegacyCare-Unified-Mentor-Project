const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const providerProfileSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 1000 },
    serviceAreas: [{ type: String, trim: true }],
    website: { type: String, trim: true },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verificationNote: { type: String, trim: true },
    verifiedAt: Date,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: true, minlength: [8, 'Password must be at least 8 characters'], select: false },
    role: { type: String, enum: ['planner', 'nominee', 'provider', 'admin'], default: 'planner' },
    phone: { type: String, trim: true },
    city: { type: String, trim: true },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    isVerified: { type: Boolean, default: false }, // identity verified by admin
    provider: providerProfileSchema,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
