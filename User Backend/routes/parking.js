const express = require('express');
const axios = require('axios');
const ParkingCache = require('../models/ParkingCache');
const router = express.Router();

// Fixed coordinates to match actual LTA carpark locations
const TARGET_ZONES = [
  { name: 'Orchard', lat: 1.3040, lng: 103.8340, radius: 0.8 },
  { name: 'Marina', lat: 1.2920, lng: 103.8560, radius: 0.8 },
  { name: 'Harbourfront', lat: 1.2640, lng: 103.8210, radius: 0.8 },
];

function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /parking/availability
router.get('/availability', async (req, res) => {
  try {
    const response = await axios.get(
      'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      { headers: { AccountKey: process.env.LTA_API_KEY, accept: 'application/json' } }
    );

    const allCarparks = response.data.value;

    // Filter to carparks near your 3 zones
    const relevant = allCarparks.filter((cp) => {
      if (!cp.Location) return false;
      const [lat, lng] = cp.Location.split(' ').map(Number);
      return TARGET_ZONES.some(
        (zone) => getDistance(lat, lng, zone.lat, zone.lng) <= zone.radius
      );
    });

    // Cache to MongoDB
    await ParkingCache.deleteMany({});
    const toInsert = relevant.map((cp) => {
      const [lat, lng] = (cp.Location || '0 0').split(' ').map(Number);
      return {
        carparkNumber: cp.CarParkID,
        area: cp.Area,
        development: cp.Development,
        location: { lat, lng },
        availableLots: cp.AvailableLots,
        lotType: cp.LotType,
        agencyCode: cp.Agency,
        fetchedAt: new Date()
      };
    });

    await ParkingCache.insertMany(toInsert);

    res.json({ success: true, count: relevant.length, data: toInsert });
  } catch (err) {
    console.error('LTA API Error:', err.message);
    // Fallback: return last cached data
    const cached = await ParkingCache.find().sort({ fetchedAt: -1 });
    res.json({ success: true, count: cached.length, data: cached, fromCache: true });
  }
});

// GET /parking/cached — just return DB data without hitting LTA
router.get('/cached', async (req, res) => {
  const data = await ParkingCache.find().sort({ fetchedAt: -1 });
  res.json({ success: true, data });
});

module.exports = router;