const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';
const TOTAL_CAPACITY = 100;

let db;
let client;

// Collections
let parkingCollection;
let statusCollection;
let usersCollection;
let parkingsCollection;

async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4 — fixes SRV DNS issues locally
    });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ MongoDB Connected Successfully!');

    db = client.db('smart_parking');
    parkingCollection  = db.collection('parking_records');
    statusCollection   = db.collection('parking_status');
    usersCollection    = db.collection('users');
    parkingsCollection = db.collection('parkings');

    // Initialize status doc if missing
    const status = await statusCollection.findOne({ _id: 'status' });
    if (!status) {
      await statusCollection.insertOne({ _id: 'status', available_slots: TOTAL_CAPACITY });
    }

    // Create indexes
    await parkingCollection.createIndex({ Plate_Number: 1, Exit_Time: 1 });
    await parkingCollection.createIndex({ Plate_Number: 1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log('✅ Indexes created.');
  } catch (err) {
    console.error('❌ CRITICAL: MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

function getCollections() {
  return {
    parkingCollection,
    statusCollection,
    usersCollection,
    parkingsCollection,
    TOTAL_CAPACITY,
    ObjectId,
  };
}

module.exports = { connectDB, getCollections };
