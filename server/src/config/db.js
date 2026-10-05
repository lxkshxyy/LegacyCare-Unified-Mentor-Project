const mongoose = require('mongoose');
// Fix for 'querySrv ECONNREFUSED' on some Windows / ISP networks:
// use public DNS servers to resolve the MongoDB Atlas SRV record.
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error('MONGO_URI is not set');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDB;
