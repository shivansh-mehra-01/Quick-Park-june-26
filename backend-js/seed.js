/**
 * seed.js — seed_parkings.py ka JS equivalent
 * Run: node seed.js
 * Sab purana data delete karke naye 25 Bhopal parkings insert karta hai
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/';

function randomizeSlots(total) {
  const min = Math.floor(total * 0.20);
  const max = Math.floor(total * 0.95);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const parkings = [
  { name: 'DB City Mall Parking',       address: 'MP Nagar Zone 1',   city: 'Bhopal', area: 'MP Nagar',     latitude: 23.2336, longitude: 77.4322, total_capacity: 800,  type: 'mall',     deviceKey: 'DBMALL123' },
  { name: 'Aashima Mall Parking',       address: 'Hoshangabad Road',   city: 'Bhopal', area: 'Bagh Sewania', latitude: 23.1927, longitude: 77.4640, total_capacity: 400,  type: 'mall',     deviceKey: 'AASHIMA123' },
  { name: 'Minal Mall Parking',         address: 'Govindpura',         city: 'Bhopal', area: 'Govindpura',   latitude: 23.2599, longitude: 77.4623, total_capacity: 300,  type: 'mall',     deviceKey: 'MINAL123' },
  { name: 'Aura Mall Parking',          address: 'Gulmohar',           city: 'Bhopal', area: 'Gulmohar',     latitude: 23.2178, longitude: 77.4335, total_capacity: 350,  type: 'mall',     deviceKey: 'AURA123' },
  { name: "People's Mall Parking",      address: 'Bhanpur',            city: 'Bhopal', area: 'Bhanpur',      latitude: 23.2975, longitude: 77.3712, total_capacity: 500,  type: 'mall',     deviceKey: 'PEOPLESMALL123' },
  { name: 'C21 Mall Parking',           address: 'Misrod',             city: 'Bhopal', area: 'Misrod',       latitude: 23.1672, longitude: 77.4705, total_capacity: 300,  type: 'mall',     deviceKey: 'C21MALL123' },
  { name: 'Capital Mall Parking',       address: 'Misrod',             city: 'Bhopal', area: 'Misrod',       latitude: 23.1700, longitude: 77.4720, total_capacity: 250,  type: 'mall',     deviceKey: 'CAPITAL123' },
  { name: 'Metro Plaza Parking',        address: 'MP Nagar',           city: 'Bhopal', area: 'MP Nagar',     latitude: 23.2315, longitude: 77.4352, total_capacity: 200,  type: 'private',  deviceKey: 'METRO123' },
  { name: 'New Market Multi-Level Parking',    address: 'TT Nagar',   city: 'Bhopal', area: 'New Market',   latitude: 23.2285, longitude: 77.4029, total_capacity: 1000, type: 'govt',     deviceKey: 'NEWMARKET123' },
  { name: 'MP Nagar Multi-Level Parking',      address: 'MP Nagar Zone 1', city: 'Bhopal', area: 'MP Nagar', latitude: 23.2330, longitude: 77.4350, total_capacity: 700, type: 'govt',    deviceKey: 'MPNAGAR123' },
  { name: 'Ibrahimpura Multi-Level Parking',   address: 'Old City',   city: 'Bhopal', area: 'Ibrahimpura',  latitude: 23.2593, longitude: 77.4084, total_capacity: 500,  type: 'govt',     deviceKey: 'IBRAHIMPURA123' },
  { name: 'Bairagarh Multi-Level Parking',     address: 'Bairagarh',  city: 'Bhopal', area: 'Bairagarh',    latitude: 23.2798, longitude: 77.3375, total_capacity: 400,  type: 'govt',     deviceKey: 'BAIRAGARH123' },
  { name: 'AIIMS Bhopal Parking',              address: 'Saket Nagar', city: 'Bhopal', area: 'AIIMS',       latitude: 23.2086, longitude: 77.4570, total_capacity: 600,  type: 'hospital', deviceKey: 'AIIMS123' },
  { name: 'Bansal Hospital Parking',           address: 'Shahpura',   city: 'Bhopal', area: 'Shahpura',     latitude: 23.2170, longitude: 77.4415, total_capacity: 250,  type: 'hospital', deviceKey: 'BANSAL123' },
  { name: 'Chirayu Hospital Parking',          address: 'Bairagarh',  city: 'Bhopal', area: 'Bairagarh',    latitude: 23.2805, longitude: 77.3380, total_capacity: 200,  type: 'hospital', deviceKey: 'CHIRAYU123' },
  { name: "People's Hospital Parking",         address: 'Karond',     city: 'Bhopal', area: 'Karond',       latitude: 23.3095, longitude: 77.4050, total_capacity: 400,  type: 'hospital', deviceKey: 'PEOPLESHOSP123' },
  { name: 'Rani Kamlapati Railway Station Parking', address: 'Habibganj', city: 'Bhopal', area: 'Habibganj', latitude: 23.2296, longitude: 77.4411, total_capacity: 700, type: 'govt',    deviceKey: 'RKMP123' },
  { name: 'Bhopal Junction Railway Station Parking', address: 'Station Area', city: 'Bhopal', area: 'Station', latitude: 23.2599, longitude: 77.4126, total_capacity: 600, type: 'govt', deviceKey: 'BPLJUNCTION123' },
  { name: 'ISBT Habibganj Bus Terminal Parking',    address: 'Habibganj', city: 'Bhopal', area: 'Habibganj', latitude: 23.2260, longitude: 77.4418, total_capacity: 500, type: 'govt',    deviceKey: 'ISBT123' },
  { name: 'Raja Bhoj Airport Parking',         address: 'Airport Road', city: 'Bhopal', area: 'Airport',    latitude: 23.2875, longitude: 77.3374, total_capacity: 450,  type: 'govt',     deviceKey: 'AIRPORT123' },
  { name: 'Courtyard by Marriott Parking',     address: 'Gulmohar',   city: 'Bhopal', area: 'Gulmohar',     latitude: 23.2175, longitude: 77.4340, total_capacity: 200,  type: 'private',  deviceKey: 'MARRIOTT123' },
  { name: 'Jehan Numa Palace Parking',         address: 'Shamla Hills', city: 'Bhopal', area: 'Shamla Hills', latitude: 23.2380, longitude: 77.3925, total_capacity: 150, type: 'private', deviceKey: 'JEHAN123' },
  { name: 'Noor-Us-Sabah Palace Parking',      address: 'VIP Road',   city: 'Bhopal', area: 'VIP Road',     latitude: 23.2425, longitude: 77.3940, total_capacity: 150,  type: 'private',  deviceKey: 'NOOR123' },
  { name: 'MANIT Bhopal Parking',              address: 'MANIT Campus', city: 'Bhopal', area: 'MANIT',      latitude: 23.2167, longitude: 77.4085, total_capacity: 500,  type: 'private',  deviceKey: 'MANIT123' },
  { name: 'Barkatullah University Parking',    address: 'Hoshangabad Road', city: 'Bhopal', area: 'Barkatullah University', latitude: 23.2035, longitude: 77.4600, total_capacity: 400, type: 'private', deviceKey: 'BU123' },
].map(p => ({ ...p, available_slots: randomizeSlots(p.total_capacity), rate_per_hour: 30 }));

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db('smart_parking');
    const col = db.collection('parkings');

    await col.deleteMany({});
    const result = await col.insertMany(parkings);
    console.log(`✅ Inserted ${result.insertedCount} parkings!`);

    const sample = await col.find().limit(5).toArray();
    sample.forEach(p => console.log(` - ${p.name} | Total: ${p.total_capacity} | Available: ${p.available_slots}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
