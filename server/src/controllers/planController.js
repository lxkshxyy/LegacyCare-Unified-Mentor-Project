const fs = require('fs');
const path = require('path');
const Plan = require('../models/Plan');
const Service = require('../models/Service');
const User = require('../models/User');
const Document = require('../models/Document');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notify');
const { UPLOAD_DIR } = require('../middleware/upload');

const POPULATE = [
  {
    path: 'selectedServices.service',
    select: 'title category price priceUnit city isAvailable description',
  },
  {
    path: 'selectedServices.provider',
    select: 'name email phone city provider.businessName provider.verificationStatus',
  },
  { path: 'ritual.category', select: 'name tradition' },
  { path: 'owner', select: 'name email phone city' },
];

const isOwner = (plan, user) => String(plan.owner._id || plan.owner) === String(user._id);
const nomineeEntry = (plan, user) =>
  (plan.nominees || []).find((n) => n.email === user.email && n.accessGranted);

/** Owner always; nominee only when plan is finalized and access is granted. */
function accessLevel(plan, user) {
  if (isOwner(plan, user)) return 'owner';
  if (plan.status === 'finalized' && nomineeEntry(plan, user)) return 'nominee';
  return null;
}

async function loadPlan(id, user, { ownerOnly = false } = {}) {
  const plan = await Plan.findById(id);
  if (!plan) throw new ApiError(404, 'Plan not found');
  const level = accessLevel(plan, user);
  if (!level || (ownerOnly && level !== 'owner')) throw new ApiError(403, 'You do not have access to this plan');
  return { plan, level };
}

const serialize = (plan) => ({ ...plan.toJSON(), completion: plan.completion() });

async function notifyNominees(plan, message) {
  const emails = plan.nominees.filter((n) => n.accessGranted).map((n) => n.email);
  if (!emails.length) return;
  const users = await User.find({ email: { $in: emails } }).select('_id');
  await Promise.all(users.map((u) => notify(u._id, message, `/nominee/plans/${plan._id}`)));
}

// GET /api/plans
exports.getMyPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ owner: req.user._id }).sort('-updatedAt');
  res.json({ plans: plans.map(serialize) });
});

// GET /api/plans/shared  (plans where I am a nominee)
exports.getSharedPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({
    status: 'finalized',
    nominees: { $elemMatch: { email: req.user.email, accessGranted: true } },
  })
    .populate('owner', 'name email city')
    .sort('-finalizedAt');

  res.json({
    plans: plans.map((p) => {
      const me = nomineeEntry(p, req.user);
      return {
        _id: p._id,
        title: p.title,
        owner: p.owner,
        relation: me ? me.relation : '',
        finalizedAt: p.finalizedAt,
        updatedAt: p.updatedAt,
        city: p.location && p.location.city,
        servicesCount: p.selectedServices.length,
      };
    }),
  });
});

// POST /api/plans
exports.createPlan = asyncHandler(async (req, res) => {
  const plan = new Plan({ owner: req.user._id, title: req.body.title || 'My Funeral Plan' });
  applyUpdates(plan, req.body);
  plan.updateHistory.push({ summary: 'Plan created' });
  await plan.save();
  res.status(201).json({ plan: serialize(plan) });
});

// GET /api/plans/:id
exports.getPlan = asyncHandler(async (req, res) => {
  const { plan, level } = await loadPlan(req.params.id, req.user);
  await plan.populate(POPULATE);
  const documents = await Document.find({ plan: plan._id }).sort('-createdAt');
  const data = serialize(plan);
  if (level === 'nominee') {
    // Nominees do not see other nominees' private phone numbers
    data.nominees = data.nominees.map(({ name, relation, email }) => ({ name, relation, email }));
  }
  res.json({ plan: data, documents, access: level });
});

const EDITABLE = ['title', 'disposition', 'personalNotes'];
const NESTED = {
  location: ['venue', 'city', 'state', 'notes'],
  ritual: ['type', 'tradition', 'category', 'details'],
  officiant: ['preference', 'name', 'contact', 'notes'],
  ceremony: ['music', 'prayers', 'customs', 'dressCode', 'otherInstructions'],
  budget: ['limit', 'currency'],
};

function applyUpdates(plan, body) {
  EDITABLE.forEach((k) => {
    if (body[k] !== undefined) plan[k] = body[k];
  });
  Object.entries(NESTED).forEach(([group, keys]) => {
    if (!body[group]) return;
    keys.forEach((k) => {
      if (body[group][k] !== undefined) {
        let v = body[group][k];
        if (group === 'ritual' && k === 'category' && !v) v = undefined;
        plan.set(`${group}.${k}`, v);
      }
    });
  });
}

// PUT /api/plans/:id
exports.updatePlan = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  applyUpdates(plan, req.body);
  plan.version += 1;
  plan.updateHistory.push({ summary: req.body.summary || 'Plan details updated' });
  if (plan.updateHistory.length > 50) plan.updateHistory = plan.updateHistory.slice(-50);
  await plan.save();
  if (plan.status === 'finalized') await notifyNominees(plan, `${req.user.name} updated the plan "${plan.title}".`);
  await plan.populate(POPULATE);
  res.json({ plan: serialize(plan) });
});

// DELETE /api/plans/:id
exports.deletePlan = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const docs = await Document.find({ plan: plan._id }).select('+storedName');
  docs.forEach((d) => fs.unlink(path.join(UPLOAD_DIR, d.storedName), () => {}));
  await Document.deleteMany({ plan: plan._id });
  await plan.deleteOne();
  res.json({ message: 'Plan deleted' });
});

// POST /api/plans/:id/finalize
exports.finalizePlan = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const missing = [];
  if (!plan.location || !plan.location.city) missing.push('funeral location (city)');
  if (!plan.ritual || !plan.ritual.type) missing.push('ritual type');
  if (!plan.nominees.length) missing.push('at least one nominee');
  if (missing.length) throw new ApiError(400, `Please add ${missing.join(', ')} before finalizing`);

  plan.status = 'finalized';
  plan.finalizedAt = new Date();
  plan.version += 1;
  plan.updateHistory.push({ summary: 'Plan finalized' });
  await plan.save();
  await notifyNominees(plan, `${req.user.name} has shared a finalized plan "${plan.title}" with you.`);
  await notify(req.user._id, `Your plan "${plan.title}" is finalized and securely saved.`, `/planner/plans/${plan._id}`);
  await plan.populate(POPULATE);
  res.json({ plan: serialize(plan) });
});

// POST /api/plans/:id/reopen
exports.reopenPlan = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  plan.status = 'draft';
  plan.version += 1;
  plan.updateHistory.push({ summary: 'Plan reopened for editing' });
  await plan.save();
  res.json({ plan: serialize(plan) });
});

// POST /api/plans/:id/services  { serviceId, note }
exports.addService = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const service = await Service.findById(req.body.serviceId);
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found');
  if (plan.selectedServices.some((s) => String(s.service) === String(service._id))) {
    throw new ApiError(409, 'This service is already in your plan');
  }
  plan.selectedServices.push({
    service: service._id,
    provider: service.provider,
    priceAtSelection: service.price,
    note: req.body.note,
  });
  plan.recalculateBudget();
  plan.version += 1;
  plan.updateHistory.push({ summary: `Added service: ${service.title}` });
  await plan.save();
  await plan.populate(POPULATE);
  res.status(201).json({ plan: serialize(plan) });
});

// DELETE /api/plans/:id/services/:itemId
exports.removeService = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const item = plan.selectedServices.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Service not in plan');
  item.deleteOne();
  plan.recalculateBudget();
  plan.version += 1;
  plan.updateHistory.push({ summary: 'Removed a service' });
  await plan.save();
  await plan.populate(POPULATE);
  res.json({ plan: serialize(plan) });
});

// POST /api/plans/:id/nominees
exports.addNominee = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const { name, email, relation, phone, accessGranted = true } = req.body;
  const normalized = String(email || '').toLowerCase().trim();
  if (normalized === req.user.email) throw new ApiError(400, 'You cannot add yourself as a nominee');
  if (plan.nominees.some((n) => n.email === normalized)) throw new ApiError(409, 'This nominee is already added');
  plan.nominees.push({ name, email: normalized, relation, phone, accessGranted });
  plan.version += 1;
  plan.updateHistory.push({ summary: `Added nominee: ${name}` });
  await plan.save();
  if (plan.status === 'finalized' && accessGranted) {
    const u = await User.findOne({ email: normalized });
    if (u) await notify(u._id, `${req.user.name} has shared a plan with you.`, `/nominee/plans/${plan._id}`);
  }
  await plan.populate(POPULATE);
  res.status(201).json({ plan: serialize(plan) });
});

// PATCH /api/plans/:id/nominees/:nomineeId
exports.updateNominee = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const n = plan.nominees.id(req.params.nomineeId);
  if (!n) throw new ApiError(404, 'Nominee not found');
  ['name', 'relation', 'phone', 'accessGranted'].forEach((k) => {
    if (req.body[k] !== undefined) n[k] = req.body[k];
  });
  plan.version += 1;
  plan.updateHistory.push({ summary: `Updated nominee: ${n.name}` });
  await plan.save();
  await plan.populate(POPULATE);
  res.json({ plan: serialize(plan) });
});

// DELETE /api/plans/:id/nominees/:nomineeId
exports.removeNominee = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true });
  const n = plan.nominees.id(req.params.nomineeId);
  if (!n) throw new ApiError(404, 'Nominee not found');
  n.deleteOne();
  plan.version += 1;
  plan.updateHistory.push({ summary: 'Removed a nominee' });
  await plan.save();
  await plan.populate(POPULATE);
  res.json({ plan: serialize(plan) });
});

// ---------- Documents ----------

// POST /api/plans/:id/documents (multipart: file, label)
exports.uploadDocument = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user, { ownerOnly: true }).catch((e) => {
    if (req.file) fs.unlink(req.file.path, () => {});
    throw e;
  });
  if (!req.file) throw new ApiError(400, 'Please choose a file to upload');
  const doc = await Document.create({
    plan: plan._id,
    owner: req.user._id,
    label: req.body.label || req.file.originalname,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
  plan.version += 1;
  plan.updateHistory.push({ summary: `Uploaded document: ${doc.label}` });
  await plan.save();
  res.status(201).json({ document: doc });
});

// GET /api/plans/:id/documents
exports.listDocuments = asyncHandler(async (req, res) => {
  const { plan } = await loadPlan(req.params.id, req.user);
  const documents = await Document.find({ plan: plan._id }).sort('-createdAt');
  res.json({ documents });
});

// GET /api/documents/:docId/download
exports.downloadDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.docId).select('+storedName');
  if (!doc) throw new ApiError(404, 'Document not found');
  await loadPlan(doc.plan, req.user); // access check
  const filePath = path.join(UPLOAD_DIR, doc.storedName);
  if (!fs.existsSync(filePath)) throw new ApiError(404, 'File is missing on the server');
  res.download(filePath, doc.originalName);
});

// DELETE /api/documents/:docId
exports.deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findById(req.params.docId).select('+storedName');
  if (!doc) throw new ApiError(404, 'Document not found');
  await loadPlan(doc.plan, req.user, { ownerOnly: true });
  fs.unlink(path.join(UPLOAD_DIR, doc.storedName), () => {});
  await doc.deleteOne();
  res.json({ message: 'Document deleted' });
});

exports._accessLevel = accessLevel;
