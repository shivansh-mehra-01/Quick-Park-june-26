const express = require('express');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /pricing  (Parking lots ke rates as pricing plans) ──
router.get('/pricing', async (req, res) => {
  try {
    const { parkingsCollection } = getCollections();
    const parkings = await parkingsCollection
      .find({}, { projection: { _id: 1, name: 1, rate_per_hour: 1, type: 1 } })
      .toArray();

    // Format as pricing plans
    const plans = parkings.map(p => ({
      _id: p._id.toString(),
      type: p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : 'Standard',
      rate: `Rs.${p.rate_per_hour ?? 30}/hr`,
      rate_value: p.rate_per_hour ?? 30,
      description: `${p.name} — Hourly rate. Minimum 1 hour charge.`,
      name: p.name,
      active: true,
    }));

    res.json(plans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── PUT /pricing/:id  (Update a parking's rate) ──
router.put('/pricing/:id', async (req, res) => {
  try {
    const { parkingsCollection } = getCollections();
    const { id } = req.params;
    const { rate, type, description } = req.body;

    let oid;
    try { oid = new ObjectId(id); } catch (_) {
      return res.status(400).json({ error: 'Invalid pricing ID' });
    }

    const update = {};
    if (rate !== undefined) {
      // Extract numeric value from strings like "Rs.40/hr" or just "40"
      const numeric = parseFloat(String(rate).replace(/[^\d.]/g, ''));
      if (!isNaN(numeric)) update.rate_per_hour = numeric;
    }
    if (type !== undefined) update.type = type.toLowerCase();

    await parkingsCollection.updateOne({ _id: oid }, { $set: update });
    res.json({ message: 'Pricing updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
