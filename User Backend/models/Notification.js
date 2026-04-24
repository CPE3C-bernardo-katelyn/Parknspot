const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['parking_available', 'parking_full', 'system', 'update'],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    parkingSpotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParkingSpot',
      default: null,
    },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);