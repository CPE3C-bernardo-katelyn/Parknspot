const mongoose = require('mongoose');

// Caches LTA API data to avoid hitting rate limits
const parkingCacheSchema = new mongoose.Schema({
  carparkNumber: { type: String },
  area: { type: String },
  development: { type: String },
  location: {
    lat: Number,
    lng: Number
  },
  availableLots: { type: Number },
  lotType: { type: String },
  agencyCode: { type: String },
  fetchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingCache', parkingCacheSchema);