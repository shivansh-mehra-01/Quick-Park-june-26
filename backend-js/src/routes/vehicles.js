const express = require('express');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../db');

const router = express.Router();

// Helper: try to convert string to ObjectId
function toObjectId(id) {
  if (id && typeof id === 'string' && id.length === 24) {
    try { return new ObjectId(id); } catch (_) {}
  }
  return id;
}

// ── POST /entry  (Vehicle Entry) ──
router.post(['/api/vehicle-entry', '/vehicle-entry', '/entry'], async (req, res) => {
  try {
    const { parkingCollection, parkingsCollection, statusCollection, TOTAL_CAPACITY } = getCollections();
    const { plateNumber, plate_number, parkingId, parking_id } = req.body;

    const plate = plateNumber || plate_number;
    const rawId = parkingId || parking_id;

    if (!plate) return res.status(400).json({ error: 'Plate number is required' });

    const p_oid = toObjectId(rawId);

    // Already parked check
    const existing = await parkingCollection.findOne({ Plate_Number: plate, Exit_Time: null });
    if (existing) return res.status(400).json({ error: 'Vehicle already parked' });

    // Get available slots
    let parking = null;
    let available_slots;

    if (rawId) {
      parking = await parkingsCollection.findOne({ _id: p_oid });
    }

    if (parking) {
      available_slots = parking.available_slots ?? 0;
    } else {
      const status = await statusCollection.findOne({ _id: 'status' });
      available_slots = status?.available_slots ?? 0;
    }

    if (available_slots <= 0) return res.status(400).json({ error: 'Parking is full' });

    const entry_time = new Date();

    // Insert entry record
    await parkingCollection.insertOne({
      Plate_Number: plate,
      Parking_Id: rawId || null,
      Parking_Name: parking?.name || 'Aashima Mall Parking',
      Entry_Time: entry_time,
      Exit_Time: null,
      Total_Time: null,
    });

    // Decrement slot
    if (parking) {
      await parkingsCollection.updateOne({ _id: p_oid }, { $inc: { available_slots: -1 } });
    } else {
      await statusCollection.updateOne({ _id: 'status' }, { $inc: { available_slots: -1 } });
    }

    res.status(201).json({
      message: `Vehicle ${plate} entered at ${parking?.name || 'Parking'}`,
      available_slots: available_slots - 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── POST /exit  (Vehicle Exit + FASTag Payment) ──
router.post(['/api/vehicle-exit', '/vehicle-exit', '/exit'], async (req, res) => {
  try {
    const { parkingCollection, parkingsCollection, statusCollection, usersCollection, paymentsCollection } = getCollections();
    const { plateNumber, plate_number } = req.body;

    const plate = plateNumber || plate_number;
    if (!plate) return res.status(400).json({ error: 'Plate number is required' });

    // Find active record
    const record = await parkingCollection.findOne({ Plate_Number: plate, Exit_Time: null });
    if (!record) return res.status(404).json({ error: `Vehicle ${plate} not found in parking` });

    const p_id = record.Parking_Id;
    const p_oid = toObjectId(p_id);

    // Get rate from parking doc
    let rate_per_hour = 30; // Default
    let parking_doc = null;
    if (p_id) {
      parking_doc = await parkingsCollection.findOne({ _id: p_oid });
      if (parking_doc) rate_per_hour = parking_doc.rate_per_hour ?? 30;
    }

    const exit_time = new Date();
    const entry_time = record.Entry_Time;
    const duration_ms = exit_time - entry_time;
    const total_time_minutes = duration_ms / 60000;

    // Minimum 1 hour, then per hour
    const hours = Math.floor(total_time_minutes / 60) + 1;
    const total_fee = Math.max(rate_per_hour, hours * rate_per_hour);

    console.log(`DEBUG: ${plate} — ${total_time_minutes.toFixed(1)} mins @ Rs.${rate_per_hour}/hr → Fee: Rs.${total_fee}`);

    // FASTag-style auto payment
    const user = await usersCollection.findOne({
      vehicles: { $regex: `^${plate}$`, $options: 'i' },
    });

    let payment_status = 'Paid (Cash)';
    let auto_pay_msg = 'Cash payment required at exit.';

    if (user) {
      const wallet_balance = user.wallet_balance ?? 0;
      if (wallet_balance >= total_fee) {
        const new_balance = wallet_balance - total_fee;
        await usersCollection.updateOne({ _id: user._id }, { $set: { wallet_balance: new_balance } });
        payment_status = 'Paid (Wallet)';
        auto_pay_msg = `FASTag detected! Rs.${total_fee} deducted. New Balance: Rs.${new_balance}`;
        console.log(`DEBUG: Payment OK. New balance: ${new_balance}`);
      } else {
        auto_pay_msg = 'FASTag user found but insufficient balance. Please pay cash.';
        console.log(`DEBUG: Insufficient balance for ${user.email}`);
      }
    } else {
      console.log(`DEBUG: No user found for plate ${plate}`);
    }

    // Update parking record
    await parkingCollection.updateOne(
      { _id: record._id },
      {
        $set: {
          Exit_Time: exit_time,
          Total_Time: `${Math.floor(total_time_minutes)} mins`,
          Fee: total_fee,
          Payment_Status: payment_status,
        },
      }
    );

    // Save payment record
    await paymentsCollection.insertOne({
      record_id: record._id,
      user_id: user?._id || null,
      plate_number: plate,
      amount: total_fee,
      status: payment_status,
      timestamp: exit_time,
    });

    // Increment slot
    const target_oid = toObjectId(p_id);
    if (target_oid && p_id) {
      await parkingsCollection.updateOne({ _id: target_oid }, { $inc: { available_slots: 1 } });
    } else {
      await statusCollection.updateOne({ _id: 'status' }, { $inc: { available_slots: 1 } });
    }

    // Fresh available slots
    let available_now = 0;
    if (target_oid && p_id) {
      const p_doc = await parkingsCollection.findOne({ _id: target_oid });
      available_now = p_doc?.available_slots ?? 0;
    }

    res.json({
      message: `Vehicle ${plate} exited. ${auto_pay_msg}`,
      vehicle: {
        entryTime: entry_time.toISOString(),
        exitTime: exit_time.toISOString(),
        total_time: Math.floor(total_time_minutes),
      },
      fee: total_fee,
      payment_status,
      available_slots: available_now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /active-vehicles  (Exit camera ke liye fast list) ──
router.get('/active-vehicles', async (req, res) => {
  try {
    const { parkingCollection } = getCollections();
    const records = await parkingCollection
      .find({ Exit_Time: null }, { projection: { _id: 0, Plate_Number: 1 } })
      .toArray();
    const plates = records
      .filter(r => r.Plate_Number)
      .map(r => ({ plateNumber: r.Plate_Number }));
    res.json(plates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
