const express = require('express');
const rateLimit = require('express-rate-limit');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const auth = require('../controllers/authController');
const plans = require('../controllers/planController');
const services = require('../controllers/serviceController');
const requests = require('../controllers/requestController');
const categories = require('../controllers/categoryController');
const admin = require('../controllers/adminController');
const misc = require('../controllers/miscController');

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });

// ---- Auth ----
router.post('/auth/register', authLimiter, auth.register);
router.post('/auth/login', authLimiter, auth.login);
router.get('/auth/me', protect, auth.me);
router.put('/auth/me', protect, auth.updateMe);
router.put('/auth/password', protect, auth.changePassword);

// ---- Plans (planner owns; nominee reads shared) ----
router.get('/plans', protect, authorize('planner'), plans.getMyPlans);
router.post('/plans', protect, authorize('planner'), plans.createPlan);
router.get('/plans/shared', protect, plans.getSharedPlans);
router.get('/plans/:id', protect, plans.getPlan);
router.put('/plans/:id', protect, authorize('planner'), plans.updatePlan);
router.delete('/plans/:id', protect, authorize('planner'), plans.deletePlan);
router.post('/plans/:id/finalize', protect, authorize('planner'), plans.finalizePlan);
router.post('/plans/:id/reopen', protect, authorize('planner'), plans.reopenPlan);
router.post('/plans/:id/services', protect, authorize('planner'), plans.addService);
router.delete('/plans/:id/services/:itemId', protect, authorize('planner'), plans.removeService);
router.post('/plans/:id/nominees', protect, authorize('planner'), plans.addNominee);
router.patch('/plans/:id/nominees/:nomineeId', protect, authorize('planner'), plans.updateNominee);
router.delete('/plans/:id/nominees/:nomineeId', protect, authorize('planner'), plans.removeNominee);
router.get('/plans/:id/documents', protect, plans.listDocuments);
router.post('/plans/:id/documents', protect, authorize('planner'), upload.single('file'), plans.uploadDocument);
router.get('/documents/:docId/download', protect, plans.downloadDocument);
router.delete('/documents/:docId', protect, authorize('planner'), plans.deleteDocument);

// ---- Services (public directory + provider management) ----
router.get('/services', services.listServices);
router.get('/services/cities', services.listCities);
router.get('/services/mine/list', protect, authorize('provider'), services.myServices);
router.get('/services/:id', services.getService);
router.post('/services', protect, authorize('provider'), services.createService);
router.put('/services/:id', protect, authorize('provider'), services.updateService);
router.delete('/services/:id', protect, authorize('provider'), services.deleteService);

// ---- Service requests ----
router.post('/requests', protect, authorize('planner', 'nominee'), requests.createRequest);
router.get('/requests', protect, requests.listRequests);
router.patch('/requests/:id/status', protect, requests.updateStatus);

// ---- Categories ----
router.get('/categories', optionalAuth, categories.list);
router.post('/categories', protect, authorize('admin'), categories.create);
router.put('/categories/:id', protect, authorize('admin'), categories.update);
router.delete('/categories/:id', protect, authorize('admin'), categories.remove);

// ---- Disputes, notifications, feedback ----
router.post('/disputes', protect, misc.createDispute);
router.get('/disputes/mine', protect, misc.myDisputes);
router.get('/notifications', protect, misc.myNotifications);
router.patch('/notifications/read-all', protect, misc.markAllRead);
router.patch('/notifications/:id/read', protect, misc.markRead);
router.post('/feedback', protect, misc.createFeedback);

// ---- Admin ----
router.use('/admin', protect, authorize('admin'));
router.get('/admin/stats', admin.stats);
router.get('/admin/users', admin.listUsers);
router.patch('/admin/users/:id', admin.updateUser);
router.patch('/admin/providers/:id/verification', admin.verifyProvider);
router.get('/admin/disputes', admin.listDisputes);
router.patch('/admin/disputes/:id', admin.updateDispute);
router.get('/admin/feedback', admin.listFeedback);

module.exports = router;
