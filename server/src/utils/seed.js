/* eslint-disable no-console */
/**
 * Seeds demo data. WARNING: clears existing collections.
 * Usage: npm run seed
 */
require('dotenv').config();
// Fix for 'querySrv ECONNREFUSED' on some Windows / ISP networks:
// use public DNS servers to resolve the MongoDB Atlas SRV record.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Category = require('../models/Category');
const Dispute = require('../models/Dispute');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const Document = require('../models/Document');

async function seed() {
  await Promise.all(
    [User, Plan, Service, ServiceRequest, Category, Dispute, Notification, Feedback, Document].map((M) => M.deleteMany({}))
  );

  const ritualCats = await Category.insertMany([
    { name: 'Antyeshti (Cremation rites)', kind: 'ritual', tradition: 'Hindu', description: 'Traditional Hindu last rites including mukhagni and asthi visarjan.' },
    { name: 'Janazah & Burial', kind: 'ritual', tradition: 'Muslim', description: 'Ghusl, Salat al-Janazah and burial.' },
    { name: 'Christian Funeral Service', kind: 'ritual', tradition: 'Christian', description: 'Church service, prayers and burial.' },
    { name: 'Antim Sanskar & Sehaj Path', kind: 'ritual', tradition: 'Sikh', description: 'Kirtan Sohila, Ardas and cremation.' },
    { name: 'Buddhist Funeral Rites', kind: 'ritual', tradition: 'Buddhist', description: 'Chanting by monks and cremation.' },
    { name: 'Jain Antim Kriya', kind: 'ritual', tradition: 'Jain', description: 'Simple rites with Navkar Mantra recitation.' },
    { name: 'Celebration of Life', kind: 'ritual', tradition: 'Non-religious', description: 'A secular gathering to remember and celebrate.' },
  ]);
  await Category.insertMany([
    { name: 'Funeral agency', kind: 'service' },
    { name: 'Transport / hearse van', kind: 'service' },
    { name: 'Flowers & decoration', kind: 'service' },
    { name: 'Pandit / priest services', kind: 'service' },
    { name: 'Cremation / burial ground', kind: 'service' },
    { name: 'Catering (Terahvi / prayer meet)', kind: 'service' },
  ]);

  const admin = await User.create({ name: 'Platform Admin', email: 'admin@legacycare.in', password: 'Admin@1234', role: 'admin', isVerified: true, city: 'New Delhi' });
  const planner = await User.create({ name: 'Ramesh Sharma', email: 'ramesh@example.com', password: 'Planner@1234', role: 'planner', phone: '+91 98110 11223', city: 'New Delhi', isVerified: true });
  const planner2 = await User.create({ name: 'Anita Fernandes', email: 'anita@example.com', password: 'Planner@1234', role: 'planner', phone: '+91 98200 44556', city: 'Mumbai' });
  const nominee = await User.create({ name: 'Priya Sharma', email: 'priya@example.com', password: 'Nominee@1234', role: 'nominee', phone: '+91 98990 77889', city: 'Gurugram' });

  const mkProvider = (name, email, businessName, city, status, license) =>
    User.create({
      name, email, password: 'Provider@1234', role: 'provider', city, phone: '+91 90000 ' + Math.floor(10000 + Math.random() * 89999),
      isVerified: status === 'verified',
      provider: { businessName, licenseNumber: license, serviceAreas: [city], verificationStatus: status, verifiedAt: status === 'verified' ? new Date() : undefined,
        description: `${businessName} has been serving families in ${city} with care and respect.` },
    });

  const p1 = await mkProvider('Suresh Gupta', 'shanti@example.com', 'Shanti Funeral Services', 'New Delhi', 'verified', 'DL-FS-2019-0042');
  const p2 = await mkProvider('Mohammed Rafiq', 'rahat@example.com', 'Rahat Hearse & Transport', 'New Delhi', 'verified', 'DL-TR-2020-0187');
  const p3 = await mkProvider('Lakshmi Iyer', 'pushpanjali@example.com', 'Pushpanjali Florists', 'Mumbai', 'verified', 'MH-FL-2018-0311');
  const p4 = await mkProvider('Pt. Vinod Mishra', 'vedic@example.com', 'Vedic Sanskar Pandits', 'Lucknow', 'verified', 'UP-RS-2021-0099');
  const p5 = await mkProvider('Thomas George', 'peacehaven@example.com', 'Peace Haven Funeral Home', 'Bengaluru', 'pending', 'KA-FS-2024-0510');

  const services = await Service.insertMany([
    { provider: p1._id, title: 'Complete Hindu cremation package', category: 'funeral-agency', price: 25000, priceUnit: 'package', city: 'New Delhi', traditions: ['Hindu'], description: 'Arrangement of samagri, bier, pandit coordination, cremation ground booking and asthi collection.' },
    { provider: p1._id, title: 'Prayer meet (Shraddhanjali) arrangement', category: 'funeral-agency', price: 18000, priceUnit: 'package', city: 'New Delhi', traditions: ['Hindu', 'Sikh', 'Non-religious'], description: 'Venue, seating, photo frame, flowers and sound system for prayer meet.' },
    { provider: p1._id, title: 'Body preservation freezer box', category: 'funeral-agency', price: 3500, priceUnit: 'per-service', city: 'New Delhi', description: '24-hour freezer box with delivery and pickup.' },
    { provider: p2._id, title: 'AC hearse van (within city)', category: 'transport', price: 4500, priceUnit: 'per-service', city: 'New Delhi', description: 'Air-conditioned hearse van with driver and stretcher, available 24x7.' },
    { provider: p2._id, title: 'Intercity hearse transport', category: 'transport', price: 28, priceUnit: 'per-km', city: 'New Delhi', description: 'Long-distance transport to native place with all permits arranged.' },
    { provider: p3._id, title: 'White flower decoration – home & van', category: 'flowers-decoration', price: 6000, priceUnit: 'package', city: 'Mumbai', traditions: ['Hindu', 'Christian', 'Non-religious'], description: 'Tuberose and marigold garlands, van decoration and photo garland.' },
    { provider: p3._id, title: 'Church & casket floral arrangement', category: 'flowers-decoration', price: 9500, priceUnit: 'package', city: 'Mumbai', traditions: ['Christian'], description: 'Lilies, roses and wreaths for church service and casket.' },
    { provider: p4._id, title: 'Antyeshti sanskar by experienced pandit', category: 'priest-pandit', price: 5100, priceUnit: 'per-service', city: 'Lucknow', traditions: ['Hindu'], description: 'Complete Vedic rites at cremation ground including mukhagni guidance.' },
    { provider: p4._id, title: 'Terahvi / 13th day havan', category: 'priest-pandit', price: 7100, priceUnit: 'per-service', city: 'Lucknow', traditions: ['Hindu'], description: 'Havan, Garud Puran path and brahmin bhoj coordination.' },
    { provider: p4._id, title: 'Asthi visarjan at Haridwar', category: 'priest-pandit', price: 11000, priceUnit: 'package', city: 'Lucknow', traditions: ['Hindu'], description: 'Travel coordination and rites for immersion of ashes at Har Ki Pauri.' },
    { provider: p5._id, title: 'Funeral home service with chapel', category: 'funeral-agency', price: 35000, priceUnit: 'package', city: 'Bengaluru', traditions: ['Christian'], description: 'Embalming, chapel viewing and coordination (pending verification – hidden).' },
  ]);

  const plan = new Plan({
    owner: planner._id,
    title: 'My wishes – Ramesh Sharma',
    location: { venue: 'Nigambodh Ghat', city: 'New Delhi', state: 'Delhi', notes: 'Electric crematorium is fine if wood is not available.' },
    disposition: 'cremation',
    ritual: { type: 'religious', tradition: 'Hindu', category: ritualCats[0]._id, details: 'Keep the rites simple and short.' },
    officiant: { preference: 'pandit', name: 'Pt. Vinod Mishra', contact: '+91 90000 12345', notes: 'Family pandit from Lucknow.' },
    ceremony: {
      music: 'Soft bhajans – "Raghupati Raghav Raja Ram" during the prayer meet.',
      prayers: 'Gayatri Mantra and Garud Puran path.',
      customs: 'Asthi visarjan at Haridwar. No lavish feast – donate to an old-age home instead.',
      dressCode: 'White or light colours.',
      otherInstructions: 'Donate my eyes (pledge card in documents). Please inform my school friends group.',
    },
    personalNotes: 'Thank you for everything. Please do not grieve too long.',
    nominees: [{ name: 'Priya Sharma', email: 'priya@example.com', relation: 'Daughter', phone: '+91 98990 77889', accessGranted: true }],
    status: 'finalized',
    finalizedAt: new Date(),
    version: 6,
    updateHistory: [{ summary: 'Plan created' }, { summary: 'Added services' }, { summary: 'Added nominee: Priya Sharma' }, { summary: 'Plan finalized' }],
  });
  [services[0], services[3], services[7]].forEach((s) =>
    plan.selectedServices.push({ service: s._id, provider: s.provider, priceAtSelection: s.price })
  );
  plan.recalculateBudget();
  plan.budget.limit = 50000;
  await plan.save();

  const draft = new Plan({
    owner: planner2._id,
    title: 'Celebration of life plan',
    location: { city: 'Mumbai', venue: 'St. Andrew\'s Church, Bandra' },
    disposition: 'burial',
    ritual: { type: 'religious', tradition: 'Christian', category: ritualCats[2]._id },
    version: 2,
    updateHistory: [{ summary: 'Plan created' }, { summary: 'Plan details updated' }],
  });
  draft.selectedServices.push({ service: services[6]._id, provider: services[6].provider, priceAtSelection: services[6].price });
  draft.recalculateBudget();
  await draft.save();

  const r1 = await ServiceRequest.create({ plan: plan._id, requester: planner._id, provider: p1._id, service: services[0]._id, message: 'Would like to pre-book this package.', status: 'accepted', providerNote: 'Pre-booking confirmed. We will keep your details on file.', history: [{ status: 'pending', note: 'Request sent' }, { status: 'accepted', note: 'Pre-booking confirmed' }] });
  await ServiceRequest.create({ plan: plan._id, requester: planner._id, provider: p2._id, service: services[3]._id, message: 'Please confirm availability for South Delhi.', status: 'pending', history: [{ status: 'pending', note: 'Request sent' }] });
  await ServiceRequest.create({ plan: draft._id, requester: planner2._id, provider: p3._id, service: services[6]._id, message: 'Lilies preferred.', status: 'pending', history: [{ status: 'pending', note: 'Request sent' }] });

  await Feedback.insertMany([
    { user: planner._id, rating: 5, comment: 'Gave me real peace of mind. Simple to use.' },
    { user: planner2._id, rating: 4, comment: 'Would love more providers in Mumbai.' },
    { user: nominee._id, rating: 5, comment: 'Everything was clear when I needed it.' },
  ]);

  await Dispute.create({ raisedBy: planner2._id, against: p3._id, subject: 'Delay in response to request', message: 'My request has been pending for over a week.', priority: 'low', status: 'open' });

  await Notification.insertMany([
    { user: planner._id, message: 'Your plan "My wishes – Ramesh Sharma" is finalized and securely saved.', link: `/planner/plans/${plan._id}` },
    { user: planner._id, message: 'Shanti Funeral Services marked your request as accepted.', link: '/planner/requests' },
    { user: nominee._id, message: 'Ramesh Sharma has shared a finalized plan with you.', link: `/nominee/plans/${plan._id}` },
    { user: p2._id, message: 'New service request from Ramesh Sharma for "AC hearse van (within city)".', link: '/provider/requests' },
    { user: p5._id, message: 'Welcome! Your provider profile is pending verification by our team.' },
    { user: admin._id, message: 'New dispute: Delay in response to request', link: '/admin/disputes' },
  ]);

  return { admin, planner, nominee, providers: [p1, p2, p3, p4, p5], plan, r1 };
}

module.exports = seed;

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(seed)
    .then(() => {
      console.log('\nDemo data seeded. Log in with:');
      console.log('  Admin    admin@legacycare.in   / Admin@1234');
      console.log('  Planner  ramesh@example.com    / Planner@1234');
      console.log('  Nominee  priya@example.com     / Nominee@1234');
      console.log('  Provider shanti@example.com    / Provider@1234');
      console.log('  Provider (pending) peacehaven@example.com / Provider@1234\n');
      return mongoose.disconnect();
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
