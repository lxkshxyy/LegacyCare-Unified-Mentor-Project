const User = require('../models/User');
const Plan = require('../models/Plan');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Dispute = require('../models/Dispute');
const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');

const toMap = (rows) => rows.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

// GET /api/admin/stats  – the KPIs from the project brief
exports.stats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [usersByRole, plansByStatus, requestsByStatus, verifiedProviders, pendingProviders, versionAgg, recentUpdates, fb, openDisputes, activeListings, signups] =
    await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Plan.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ServiceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      User.countDocuments({ role: 'provider', 'provider.verificationStatus': 'verified' }),
      User.countDocuments({ role: 'provider', 'provider.verificationStatus': 'pending' }),
      Plan.aggregate([{ $group: { _id: null, avg: { $avg: '$version' } } }]),
      Plan.aggregate([{ $unwind: '$updateHistory' }, { $match: { 'updateHistory.at': { $gte: since } } }, { $count: 'n' }]),
      Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
      Dispute.countDocuments({ status: { $ne: 'resolved' } }),
      Service.countDocuments({ isActive: true }),
      User.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const roles = toMap(usersByRole);
  const plans = toMap(plansByStatus);
  res.json({
    kpis: {
      registeredUsers: Object.values(roles).reduce((a, b) => a + b, 0),
      completedPlans: plans.finalized || 0,
      avgPlanUpdates: Number(((versionAgg[0] && versionAgg[0].avg) || 0).toFixed(1)),
      planUpdatesLast30Days: (recentUpdates[0] && recentUpdates[0].n) || 0,
      verifiedProviders,
      satisfaction: Number(((fb[0] && fb[0].avg) || 0).toFixed(1)),
      feedbackCount: (fb[0] && fb[0].count) || 0,
    },
    usersByRole: roles,
    plansByStatus: plans,
    requestsByStatus: toMap(requestsByStatus),
    pendingProviders,
    openDisputes,
    activeListings,
    signupsByMonth: signups.map((s) => ({ month: s._id, count: s.count })),
  });
});

// GET /api/admin/users?role=&q=
exports.listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.verification) filter['provider.verificationStatus'] = req.query.verification;
  if (req.query.q) {
    const rx = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { 'provider.businessName': rx }];
  }
  const users = await User.find(filter).sort('-createdAt').limit(500);
  res.json({ users });
});

// PATCH /api/admin/users/:id  { isVerified, status }
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (String(user._id) === String(req.user._id) && req.body.status === 'suspended') {
    throw new ApiError(400, 'You cannot suspend your own account');
  }
  if (req.body.isVerified !== undefined) user.isVerified = !!req.body.isVerified;
  if (req.body.status !== undefined) user.status = req.body.status;
  await user.save({ validateBeforeSave: false });
  if (req.body.isVerified) await notify(user._id, 'Your account has been verified by LegacyCare.');
  res.json({ user });
});

// PATCH /api/admin/providers/:id/verification  { status: verified|rejected|pending, note }
exports.verifyProvider = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  if (!['verified', 'rejected', 'pending'].includes(status)) throw new ApiError(400, 'Invalid status');
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'provider') throw new ApiError(404, 'Provider not found');
  user.provider.verificationStatus = status;
  user.provider.verificationNote = note;
  user.provider.verifiedAt = status === 'verified' ? new Date() : undefined;
  if (status === 'verified') user.isVerified = true;
  await user.save({ validateBeforeSave: false });
  const msg = {
    verified: 'Your provider profile is verified. Your listings are now visible to families.',
    rejected: `Your provider verification was not approved.${note ? ` Reason: ${note}` : ''}`,
    pending: 'Your provider profile has been moved back to review.',
  }[status];
  await notify(user._id, msg, '/provider');
  res.json({ user });
});

// GET /api/admin/disputes
exports.listDisputes = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const disputes = await Dispute.find(filter)
    .populate('raisedBy', 'name email role')
    .populate('against', 'name email role provider.businessName')
    .sort('-createdAt');
  res.json({ disputes });
});

// PATCH /api/admin/disputes/:id  { status, resolution }
exports.updateDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, 'Dispute not found');
  if (req.body.status) dispute.status = req.body.status;
  if (req.body.resolution !== undefined) dispute.resolution = req.body.resolution;
  if (dispute.status === 'resolved') dispute.resolvedAt = new Date();
  await dispute.save();
  await notify(dispute.raisedBy, `Your issue "${dispute.subject}" is now ${dispute.status}.`);
  await dispute.populate([
    { path: 'raisedBy', select: 'name email role' },
    { path: 'against', select: 'name email role provider.businessName' },
  ]);
  res.json({ dispute });
});

// GET /api/admin/feedback
exports.listFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate('user', 'name role').sort('-createdAt').limit(200);
  res.json({ feedback });
});
