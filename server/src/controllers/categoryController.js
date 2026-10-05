const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/categories?kind=ritual
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.kind) filter.kind = req.query.kind;
  if (!(req.user && req.user.role === 'admin' && req.query.all === '1')) filter.isActive = true;
  const categories = await Category.find(filter).sort('kind name');
  res.json({ categories });
});

exports.create = asyncHandler(async (req, res) => {
  const { name, kind, tradition, description, isActive } = req.body;
  const category = await Category.create({ name, kind, tradition, description, isActive });
  res.status(201).json({ category });
});

exports.update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  ['name', 'kind', 'tradition', 'description', 'isActive'].forEach((k) => {
    if (req.body[k] !== undefined) category[k] = req.body[k];
  });
  await category.save();
  res.json({ category });
});

exports.remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  await category.deleteOne();
  res.json({ message: 'Category deleted' });
});
