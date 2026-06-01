const express = require('express');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /profile  (Facility Manager profile by parking_name) ──
router.get('/profile', async (req, res) => {
  try {
    const { parkingsCollection } = getCollections();
    const { parking_name } = req.query;

    if (!parking_name) {
      return res.json({
        name: 'Manager',
        role: 'Admin',
        facility_name: 'Smart Parking',
        address: 'Bhopal',
      });
    }

    const p_doc = await parkingsCollection.findOne({ name: parking_name });
    if (p_doc) {
      return res.json({
        name: p_doc.name,
        role: 'Facility Manager',
        facility_name: p_doc.name,
        address: `${p_doc.area}, ${p_doc.city}`,
        avatar_initial: p_doc.name?.[0] ?? 'P',
      });
    }

    res.json({ name: parking_name, role: 'Manager', facility_name: parking_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /profile  (Update user profile by email) ──
router.post('/profile', async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    const { email, full_name, phone, vehicles } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    const update_data = {};
    if (full_name !== undefined) update_data.full_name = full_name;
    if (phone !== undefined) update_data.phone = phone;
    if (vehicles !== undefined) update_data.vehicles = vehicles;

    await usersCollection.updateOne(
      { email },
      { $set: update_data },
      { upsert: true }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /profile  (Update facility profile — used by Profile.jsx) ──
router.put('/profile', async (req, res) => {
  try {
    const { parkingsCollection } = getCollections();
    const { name, address, totalSlots, availableSlots } = req.body;
    const parking_name = req.query.parking_name || name;

    if (!parking_name) return res.status(400).json({ error: 'Parking name is required' });

    const update = {};
    if (name !== undefined) update.name = name;
    if (address !== undefined) { update.address = address; update.area = address; }
    if (totalSlots !== undefined) update.total_capacity = parseInt(totalSlots);
    if (availableSlots !== undefined) update.available_slots = parseInt(availableSlots);

    await parkingsCollection.updateOne(
      { name: parking_name },
      { $set: update }
    );

    res.json({ message: 'Facility profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /profile/:email  (Individual user profile) ──
router.get('/profile/:email', async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    const { email } = req.params;

    console.log(`DEBUG: Profile request for email: ${email}`);
    const user = await usersCollection.findOne({ email });

    if (!user) {
      console.log(`DEBUG: User ${email} not found.`);
      return res.status(404).json({ error: 'User not found', wallet_balance: 0.0 });
    }

    const userOut = { ...user, _id: user._id.toString() };
    delete userOut.password;
    res.json(userOut);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
