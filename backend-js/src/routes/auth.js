const express = require('express');
const bcrypt = require('bcryptjs');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /auth/parkings  (Login screen ke liye) ──
// ── GET /api/parkings   (Full list) ──
// ── GET /parkings       (Full list) ──
router.get(['/auth/parkings', '/api/parkings', '/parkings'], async (req, res) => {
  try {
    const { parkingsCollection, parkingCollection } = getCollections();
    const data = await parkingsCollection
      .find({}, { projection: { _id: 1, name: 1, total_capacity: 1, available_slots: 1, latitude: 1, longitude: 1, address: 1, type: 1 } })
      .toArray();

    // Login screen — sirf names chahiye
    if (req.path === '/auth/parkings') {
      const names = data.length > 0 ? data.map(p => p.name) : ['Aashima Mall Parking'];
      return res.json(names);
    }

    // Compute dynamic available slots and update database to match
    const formatted = await Promise.all(data.map(async (p) => {
      const activeCount = await parkingCollection.countDocuments({
        Parking_Name: p.name,
        Exit_Time: null
      });
      const totalCapacity = p.total_capacity ?? 100;
      const computedAvailable = Math.max(0, totalCapacity - activeCount);

      // If stored value is different, sync it in the database
      if (p.available_slots !== computedAvailable) {
        await parkingsCollection.updateOne(
          { _id: p._id },
          { $set: { available_slots: computedAvailable } }
        );
      }

      return {
        ...p,
        _id: p._id.toString(),
        available_slots: computedAvailable
      };
    }));

    if (formatted.length === 0) {
      return res.json([{
        _id: 'local-parking-001',
        name: 'Aashima Mall Parking',
        total_capacity: 100,
        available_slots: 100,
      }]);
    }

    return res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /api/signup  ──
router.post(['/api/signup', '/signup'], async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    const { email, password, full_name, vehicle_plate } = req.body;

    if (!email || !password || !vehicle_plate) {
      return res.status(400).json({ error: 'Email, password, and at least one vehicle plate are required' });
    }

    const existing = await usersCollection.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({
      email,
      password: hashed,
      full_name,
      vehicles: [vehicle_plate.toUpperCase()],
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /auth/login  ──
router.post(['/auth/login', '/api/login', '/login'], async (req, res) => {
  try {
    const { usersCollection, parkingsCollection } = getCollections();
    const data = req.body;

    // Hardware / Device Key Login (terminal login)
    if (data.device_key) {
      const parking = await parkingsCollection.findOne({
        name: data.parking_name,
        deviceKey: data.device_key,
      });
      if (parking) {
        return res.json({ message: 'Hardware access authorized', parking: data.parking_name });
      }
      return res.status(401).json({ detail: 'Invalid Hardware Key' });
    }

    // Email / Password Login (user app)
    const { email, password } = data;
    const user = await usersCollection.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const userOut = { ...user, _id: user._id.toString() };
      delete userOut.password;
      return res.json({ message: 'Login successful', user: userOut });
    }

    res.status(401).json({ error: 'Invalid email or password' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
