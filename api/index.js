/**
 * Vercel serverless entry point.
 * The React app (client/dist) is served as static files and every /api/* request
 * is routed here, to the same Express app used in local development.
 */
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

let connection;

module.exports = async (req, res) => {
  const missing = ['MONGO_URI', 'JWT_SECRET', 'ENCRYPTION_KEY'].filter((k) => !process.env[k]);
  if (missing.length) {
    return res.status(500).json({ message: `Server is not configured. Missing environment variables: ${missing.join(', ')}` });
  }
  try {
    connection = connection || connectDB();
    await connection;
  } catch (err) {
    connection = undefined;
    return res.status(500).json({ message: `Database connection failed: ${err.message}` });
  }
  return app(req, res);
};
