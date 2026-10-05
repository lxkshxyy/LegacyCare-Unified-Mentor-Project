const ServiceRequest = require('../models/ServiceRequest');
const Service = require('../models/Service');
const Plan = require('../models/Plan');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { _accessLevel } = require('./planController');

const POP = [
  { path: 'service', select: 'title category price priceUnit city' },
  { path: 'provider', select: 'name email phone provider.businessName' },
  { path: 'requester', select: 'name email phone city' },
  { path: 'plan', select: 'title location.city status' },
];

// POST /api/requests  { planId, serviceId, message, preferredDate }
exports.createRequest = asyncHandler(async (req, res) => {
  const { planId, serviceId, message, preferredDate } = req.body;
  const plan = await Plan.findById(planId);
  if (!plan) throw new ApiError(404, 'Plan not found');
  const level = _accessLevel(plan, req.user);
  if (!level) throw new ApiError(403, 'You do not have access to this plan');

  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found');
  const provider = await User.findById(service.provider);
  if (!provider || provider.provider?.verificationStatus !== 'verified') {
    throw new ApiError(400, 'This provider is not verified yet');
  }
  if (!service.isAvailable) throw new ApiError(400, 'This service is currently unavailable');

  const open = await ServiceRequest.findOne({ plan: plan._id, service: service._id, status: { $in: ['pending', 'accepted'] } });
  if (open) throw new ApiError(409, 'There is already an open request for this service on this plan');

  const request = await ServiceRequest.create({
    plan: plan._id,
    requester: req.user._id,
    provider: service.provider,
    service: service._id,
    type: level === 'nominee' ? 'execution' : 'pre-booking',
    message,
    preferredDate: preferredDate || undefined,
    history: [{ status: 'pending', note: 'Request sent' }],
  });
  await notify(service.provider, `New service request from ${req.user.name} for "${service.title}".`, '/provider/requests');
  await request.populate(POP);
  res.status(201).json({ request });
});

// GET /api/requests
exports.listRequests = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'provider' ? { provider: req.user._id } : { requester: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.planId) filter.plan = req.query.planId;
  const requests = await ServiceRequest.find(filter).populate(POP).sort('-createdAt');
  res.json({ requests });
});

const PROVIDER_TRANSITIONS = {
  pending: ['accepted', 'declined'],
  accepted: ['completed', 'declined'],
};

// PATCH /api/requests/:id/status  { status, note }
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found');

  const isProvider = String(request.provider) === String(req.user._id);
  const isRequester = String(request.requester) === String(req.user._id);

  if (isProvider) {
    const allowed = PROVIDER_TRANSITIONS[request.status] || [];
    if (!allowed.includes(status)) throw new ApiError(400, `Cannot change a ${request.status} request to ${status}`);
  } else if (isRequester) {
    if (status !== 'cancelled' || !['pending', 'accepted'].includes(request.status)) {
      throw new ApiError(400, 'You can only cancel a pending or accepted request');
    }
  } else {
    throw new ApiError(403, 'Not your request');
  }

  request.status = status;
  if (isProvider && note) request.providerNote = note;
  request.history.push({ status, note });
  await request.save();
  await request.populate(POP);

  if (isProvider) {
    await notify(request.requester._id, `${request.provider.provider?.businessName || request.provider.name} marked your request for "${request.service.title}" as ${status}.`, '/planner/requests');
  } else {
    await notify(request.provider._id, `${req.user.name} cancelled the request for "${request.service.title}".`, '/provider/requests');
  }
  res.json({ request });
});
