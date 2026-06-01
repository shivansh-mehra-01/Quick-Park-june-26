const express = require('express');
const { getCollections } = require('../db');

const router = express.Router();

// ── GET /notifications  (System-generated alerts from DB data) ──
router.get('/notifications', async (req, res) => {
  try {
    const { parkingCollection, parkingsCollection, TOTAL_CAPACITY } = getCollections();

    const notifications = [];
    const now = new Date();
    const today_start = new Date();
    today_start.setHours(0, 0, 0, 0);

    // 1. Check for full or near-full parking lots
    const parkings = await parkingsCollection.find({}).toArray();
    for (const p of parkings) {
      const total = p.total_capacity || TOTAL_CAPACITY;
      const available = p.available_slots ?? total;
      const occupancy = ((total - available) / total) * 100;

      if (occupancy >= 95) {
        notifications.push({
          id: `full-${p._id}`,
          type: 'error',
          title: `${p.name} is Full`,
          message: `Only ${available} slot(s) remaining out of ${total}. Redirecting vehicles may be required.`,
          time: 'Just now',
        });
      } else if (occupancy >= 80) {
        notifications.push({
          id: `high-${p._id}`,
          type: 'warning',
          title: `${p.name} is Near Full`,
          message: `${Math.round(occupancy)}% occupied — ${available} slots left. Monitor closely.`,
          time: 'Live',
        });
      }
    }

    // 2. Vehicles parked for more than 12 hours
    const longStay_threshold = new Date(now - 12 * 60 * 60 * 1000);
    const long_stays = await parkingCollection.countDocuments({
      Exit_Time: null,
      Entry_Time: { $lte: longStay_threshold },
    });

    if (long_stays > 0) {
      notifications.push({
        id: 'long-stay',
        type: 'warning',
        title: `${long_stays} Vehicle(s) Parked 12+ Hours`,
        message: 'Some vehicles have exceeded the standard parking duration. Manual check may be required.',
        time: 'Today',
      });
    }

    // 3. Today's activity summary
    const entries_today = await parkingCollection.countDocuments({
      Entry_Time: { $gte: today_start },
    });

    notifications.push({
      id: 'daily-summary',
      type: 'info',
      title: 'Daily Activity Update',
      message: `${entries_today} vehicle(s) processed today across all facilities. System is operating normally.`,
      time: now.toLocaleTimeString(),
    });

    // 4. System health
    notifications.push({
      id: 'system-ok',
      type: 'info',
      title: 'Backend System Online',
      message: 'Express.js API is running. MongoDB Atlas connected. All routes responding normally.',
      time: 'Now',
    });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
