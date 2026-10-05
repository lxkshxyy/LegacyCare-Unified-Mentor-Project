const Service = require('../models/Service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const PROVIDER_FIELDS = 'name email phone city provider.businessName provider.verificationStatus provider.description provider.serviceAreas';

async function verifiedProviderIds() {
  const providers = await User.find({ role: 'provider', status: 'active', 'provider.verificationStatus': 'verified' }).select('_id');
  return providers.map((p) => p._id);
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/services  (public directory – verified providers only)
exports.listServices = asyncHandler(async (req, res) => {
  const { q, category, city, maxPrice, available, tradition, sort = 'price', page = 1, limit = 24 } = req.query;
  const filter = { isActive: true, provider: { $in: await verifiedProviderIds() } };
  if (category) filter.category = category;
  if (city) filter.city = new RegExp(`^${escapeRegex(city)}`, 'i');
  if (maxPrice) filter.price = { $lte: Number(maxPrice) };
  if (available === 'true') filter.isAvailable = true;
  if (tradition) filter.traditions = new RegExp(escapeRegex(tradition), 'i');
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { city: rx }];
  }
  const sortMap = { price: 'price', '-price': '-price', newest: '-createdAt' };
  const perPage = Math.min(Number(limit) || 24, 100);
  const skip = (Math.max(Number(page), 1) - 1) * perPage;

  const [services, total] = await Promise.all([
    Service.find(filter).populate('provider', PROVIDER_FIELDS).sort(sortMap[sort] || 'price').skip(skip).limit(perPage),
    Service.countDocuments(filter),
  ]);
  res.json({ services, total, page: Number(page), pages: Math.ceil(total / perPage) });
});

// GET /api/services/cities
exports.listCities = asyncHandler(async (req, res) => {
  const cities = await Service.distinct('city', { isActive: true, provider: { $in: await verifiedProviderIds() } });
  res.json({ cities: cities.sort() });
});

// GET /api/services/:id
exports.getService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('provider', PROVIDER_FIELDS);
  if (!service || !service.isActive) throw new ApiError(404, 'Service not found');
  res.json({ service });
});

// GET /api/services/mine/list  (provider)
exports.myServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ provider: req.user._id }).sort('-createdAt');
  res.json({ services });
});

const FIELDS = ['title', 'category', 'description', 'price', 'priceUnit', 'city', 'traditions', 'isAvailable', 'availabilityNote', 'isActive'];
const pick = (body) =>
  FIELDS.reduce((acc, k) => {
    if (body[k] !== undefined) acc[k] = body[k];
    return acc;
  }, {});

// POST /api/services
exports.createService = asyncHandler(async (req, res) => {
  const data = pick(req.body);
  if (typeof data.traditions === 'string') data.traditions = data.traditions.split(',').map((s) => s.trim()).filter(Boolean);
  const service = await Service.create({ ...data, provider: req.user._id });
  res.status(201).json({ service });
});

async function ownService(id, user) {
  const service = await Service.findById(id);
  if (!service) throw new ApiError(404, 'Service not found');
  if (String(service.provider) !== String(user._id)) throw new ApiError(403, 'Not your listing');
  return service;
}

// PUT /api/services/:id
exports.updateService = asyncHandler(async (req, res) => {
  const service = await ownService(req.params.id, req.user);
  const data = pick(req.body);
  if (typeof data.traditions === 'string') data.traditions = data.traditions.split(',').map((s) => s.trim()).filter(Boolean);
  Object.assign(service, data);
  await service.save();
  res.json({ service });
});

// DELETE /api/services/:id  (soft delete keeps plan history intact)
exports.deleteService = asyncHandler(async (req, res) => {
  const service = await ownService(req.params.id, req.user);
  service.isActive = false;
  service.isAvailable = false;
  await service.save();
  res.json({ message: 'Listing removed' });
});
