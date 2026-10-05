const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const sendAuth = (res, user, status = 200) => res.status(status).json({ token: signToken(user), user });

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'planner', phone, city, businessName, licenseNumber, serviceAreas, description } = req.body;
  if (!['planner', 'nominee', 'provider'].includes(role)) throw new ApiError(400, 'Invalid role');
  if (!password || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');

  const exists = await User.findOne({ email: (email || '').toLowerCase().trim() });
  if (exists) throw new ApiError(409, 'An account with this email already exists');

  const data = { name, email, password, role, phone, city };
  if (role === 'provider') {
    if (!businessName) throw new ApiError(400, 'Business name is required for providers');
    data.provider = {
      businessName,
      licenseNumber,
      description,
      serviceAreas: Array.isArray(serviceAreas)
        ? serviceAreas
        : String(serviceAreas || city || '').split(',').map((s) => s.trim()).filter(Boolean),
    };
  }
  const user = await User.create(data);

  const welcome = {
    planner: 'Welcome to LegacyCare. Start your plan whenever you feel ready.',
    nominee: 'Welcome to LegacyCare. Plans shared with you will appear on your dashboard.',
    provider: 'Welcome! Your provider profile is pending verification by our team.',
  }[role];
  await notify(user._id, welcome);

  sendAuth(res, user, 201);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  if (user.status === 'suspended') throw new ApiError(403, 'Your account has been suspended. Contact support.');
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });
  sendAuth(res, user);
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/me
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, phone, city, provider } = req.body;
  const user = req.user;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (city !== undefined) user.city = city;
  if (user.role === 'provider' && provider) {
    ['businessName', 'licenseNumber', 'description', 'website'].forEach((k) => {
      if (provider[k] !== undefined) user.provider[k] = provider[k];
    });
    if (provider.serviceAreas !== undefined) {
      user.provider.serviceAreas = Array.isArray(provider.serviceAreas)
        ? provider.serviceAreas
        : String(provider.serviceAreas).split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  await user.save();
  res.json({ user });
});

// PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw new ApiError(400, 'Current password is incorrect');
  if (!newPassword || newPassword.length < 8) throw new ApiError(400, 'New password must be at least 8 characters');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});
