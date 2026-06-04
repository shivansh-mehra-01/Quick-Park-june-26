const express = require('express');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /bookings/today ──
router.get('/bookings/today', async (req, res) => {
  try {
    const { parkingCollection } = getCollections();

    const today_start = new Date();
    today_start.setHours(0, 0, 0, 0);

    const records = await parkingCollection
      .find({ Entry_Time: { $gte: today_start } })
      .sort({ Entry_Time: -1 })
      .toArray();

    const formatted = records.map(r => {
      const entry = r.Entry_Time;
      const exit = r.Exit_Time;
      let duration_mins = null;
      if (exit) {
        duration_mins = (exit - entry) / 60000;
      }
      return {
        _id: r._id.toString(),
        plate_text: r.Plate_Number ?? 'Unknown',
        status: exit === null ? 'active' : 'exited',
        entry_time: entry?.toISOString() ?? null,
        exit_time: exit?.toISOString() ?? null,
        duration_mins,
        parking_name: r.Parking_Name ?? null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /bookings/export?start_date=&end_date= (CSV download) ──
router.get('/bookings/export', async (req, res) => {
  try {
    const { parkingCollection } = getCollections();
    const { start_date, end_date } = req.query;

    const start = start_date ? new Date(start_date) : new Date(0);
    const end = end_date ? new Date(end_date) : new Date();
    end.setHours(23, 59, 59, 999);

    const records = await parkingCollection
      .find({ Entry_Time: { $gte: start, $lte: end } })
      .sort({ Entry_Time: -1 })
      .toArray();

    // Build CSV
    const header = 'Plate Number,Entry Time,Exit Time,Duration (mins),Parking Name\n';
    const rows = records.map(r => {
      const entry = r.Entry_Time ? new Date(r.Entry_Time).toLocaleString() : '';
      const exit = r.Exit_Time ? new Date(r.Exit_Time).toLocaleString() : 'Still Parked';
      const duration = r.Total_Time ?? '';
      const parking = r.Parking_Name ?? '';
      return `${r.Plate_Number},${entry},${exit},${duration},${parking}`;
    });

    const csv = header + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="bookings_${start_date}_to_${end_date}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
