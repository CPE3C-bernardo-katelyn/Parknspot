const mongoose = require('mongoose');

const carparkSchema = new mongoose.Schema(
  {
    carparkID: { type: String, required: true, unique: true, trim: true },
    area: { type: String, trim: true },
    development: { type: String, trim: true },
    location: { type: String, trim: true },
    availableLots: { type: Number, default: 0, min: 0 },
    lotType: { type: String, enum: ['C', 'H', 'Y', 'L'], default: 'C' },
    agency: { type: String, enum: ['HDB', 'LTA', 'URA', 'JTC'], default: 'HDB' },
    totalLots: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['Available', 'Limited', 'Full'], default: 'Available' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

carparkSchema.pre('save', function (next) {
  if (this.availableLots === 0) {
    this.status = 'Full';
  } else if (this.availableLots <= 10) {
    this.status = 'Limited';
  } else {
    this.status = 'Available';
  }

  if (this.totalLots > 0) {
    const occupied = this.totalLots - this.availableLots;
    this.occupancyRate = Math.round((occupied / this.totalLots) * 100);
  }

  next();
});

carparkSchema.index({ carparkID: 1 });
carparkSchema.index({ status: 1 });
carparkSchema.index({ area: 1 });

module.exports = mongoose.model('Carpark', carparkSchema);