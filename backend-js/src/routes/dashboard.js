const express = require('express');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /dashboard/stats ──
router.get('/dashboard/stats', async (req, res) => {
  try {
    const { parkingCollection, parkingsCollection, TOTAL_CAPACITY } = getCollections();
    let { parking_name } = req.query;

    if (parking_name === 'null' || !parking_name) {
      return res.status(400).json({ error: 'Parking name is required' });
    }

    const filter_query = { Parking_Name: parking_name };
    let p_capacity = TOTAL_CAPACITY;

    const p_doc = await parkingsCollection.findOne({ name: parking_name });
    if (p_doc) p_capacity = p_doc.total_capacity ?? TOTAL_CAPACITY;

    const today_start = new Date();
    today_start.setHours(0, 0, 0, 0);

    const [active_sessions, entries_today, exits_today, recent_logs_raw] = await Promise.all([
      parkingCollection.countDocuments({ ...filter_query, Exit_Time: null }),
      parkingCollection.countDocuments({ ...filter_query, Entry_Time: { $gte: today_start } }),
      parkingCollection.countDocuments({ ...filter_query, Exit_Time: { $gte: today_start } }),
      parkingCollection.find(filter_query).sort({ Entry_Time: -1 }).limit(10).toArray(),
    ]);

    const recent_logs = recent_logs_raw.map(log => ({
      _id: log._id.toString(),
      plate_text: log.Plate_Number ?? 'Unknown',
      status: log.Exit_Time === null ? 'inside' : 'exited',
      entry_time: log.Entry_Time?.toISOString() ?? null,
      exit_time: log.Exit_Time?.toISOString() ?? null,
    }));

    res.json({
      total_capacity: p_capacity,
      active_sessions,
      entries_today,
      exits_today,
      avg_dwell_time_mins: 45,
      recent_logs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /occupancy/live ──
router.get('/occupancy/live', async (req, res) => {
  try {
    const { parkingCollection, parkingsCollection, TOTAL_CAPACITY } = getCollections();
    let { parking_name } = req.query;

    if (parking_name === 'null' || !parking_name) {
      return res.status(400).json({ error: 'Parking name is required' });
    }

    const filter_query = { Parking_Name: parking_name, Exit_Time: null };
    let p_capacity = TOTAL_CAPACITY;

    const p_doc = await parkingsCollection.findOne({ name: parking_name });
    if (p_doc) p_capacity = p_doc.total_capacity ?? TOTAL_CAPACITY;

    const active_sessions_raw = await parkingCollection
      .find(filter_query)
      .sort({ Entry_Time: -1 })
      .toArray();

    const sessions = active_sessions_raw.map(s => ({
      _id: s._id.toString(),
      plate_text: s.Plate_Number ?? 'Unknown',
      entry_time: s.Entry_Time?.toISOString() ?? null,
      source: 'Entry Cam',
    }));

    res.json({ total_capacity: p_capacity, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /status ──
router.get('/status', async (req, res) => {
  try {
    const { statusCollection, TOTAL_CAPACITY } = getCollections();
    const status = await statusCollection.findOne({ _id: 'status' });
    res.json({
      available_slots: status?.available_slots ?? 0,
      total_capacity: TOTAL_CAPACITY,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
