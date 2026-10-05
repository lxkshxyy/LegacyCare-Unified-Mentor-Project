const Notification = require('../models/Notification');

async function notify(userId, message, link = '') {
  if (!userId) return;
  try {
    await Notification.create({ user: userId, message, link });
  } catch (e) {
    console.error('Notification failed:', e.message);
  }
}

module.exports = notify;
