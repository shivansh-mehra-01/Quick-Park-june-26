// Force Google DNS — local Windows DNS blocks SRV queries for MongoDB Atlas
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./db');

// Route modules
const authRoutes      = require('./routes/auth');
const vehicleRoutes   = require('./routes/vehicles');
const dashboardRoutes = require('./routes/dashboard');
const profileRoutes   = require('./routes/profile');
const bookingsRoutes      = require('./routes/bookings');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Health Check ──
app.get('/', (req, res) => {
  res.json({ status: 'Smart Parking Backend (JS) is running 🚀', port: PORT });
});

// ── Routes ──
// Auth routes handle their own prefixed paths internally
app.use('/', authRoutes);
app.use('/', vehicleRoutes);
app.use('/', dashboardRoutes);
app.use('/', profileRoutes);
app.use('/', bookingsRoutes);
app.use('/', notificationsRoutes);

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Start ──
async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start();
