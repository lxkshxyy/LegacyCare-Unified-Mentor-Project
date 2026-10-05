const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// ---- Disputes ----
exports.createDispute = asyncHandler(async (req, res) => {
  const { subject, message, againstId, requestId, priority } = req.body;
  const dispute = await Dispute.create({
    raisedBy: req.user._id,
    against: againstId || undefined,
    request: requestId || undefined,
    subject,
    message,
    priority,
  });
  const admins = await User.find({ role: 'admin' }).select('_id');
  await Notification.insertMany(admins.map((a) => ({ user: a._id, message: `New dispute: ${subject}`, link: '/admin/disputes' })));
  res.status(201).json({ dispute });
});

exports.myDisputes = asyncHandler(async (req, res) => {
  const disputes = await Dispute.find({ raisedBy: req.user._id }).sort('-createdAt');
  res.json({ disputes });
});

// ---- Notifications ----
exports.myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(100);
  const unread = notifications.filter((n) => !n.read).length;
  res.json({ notifications, unread });
});

exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
  if (!n) throw new ApiError(404, 'Notification not found');
  res.json({ notification: n });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: 'All caught up' });
});

// ---- Feedback ----
exports.createFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const feedback = await Feedback.create({ user: req.user._id, rating, comment });
  res.status(201).json({ feedback });
});
