const express = require('express');
const router = express.Router();
const Carpark = require('../models/Carpark');
const { syncCarparkData, getDashboardStats } = require('../services/ltaService');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { status, area, agency, lotType, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (area) filter.area = new RegExp(area, 'i');
    if (agency) filter.agency = agency;
    if (lotType) filter.lotType = lotType;
    if (search) {
      filter.$or = [
        { carparkID: new RegExp(search, 'i') },
        { development: new RegExp(search, 'i') },
        { area: new RegExp(search, 'i') },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [carparks, total] = await Promise.all([
      Carpark.find(filter).sort({ availableLots: -1 }).skip(skip).limit(parseInt(limit)),
      Carpark.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: carparks,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const Complaint = require('../models/Complaint');
    const stats = await getDashboardStats();
    stats.dailyIncidents = await Complaint.countDocuments({ status: 'PENDING' });
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/availability-summary', async (req, res) => {
  try {
    const summary = await Carpark.aggregate([
      {
        $group: {
          _id: '$area',
          totalCarparks: { $sum: 1 },
          totalAvailableLots: { $sum: '$availableLots' },
          fullCount: { $sum: { $cond: [{ $eq: ['$status', 'Full'] }, 1, 0] } },
          availableCount: { $sum: { $cond: [{ $eq: ['$status', 'Available'] }, 1, 0] } },
          limitedCount: { $sum: { $cond: [{ $eq: ['$status', 'Limited'] }, 1, 0] } },
          avgOccupancy: { $avg: '$occupancyRate' },
        },
      },
      { $sort: { totalAvailableLots: -1 } },
      { $limit: 10 },
    ]);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const carpark = await Carpark.findOne({ carparkID: req.params.id });
    if (!carpark) return res.status(404).json({ success: false, message: 'Carpark not found' });
    res.json({ success: true, data: carpark });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/sync', protect, adminOnly, async (req, res) => {
  try {
    const result = await syncCarparkData();
    res.json({ success: true, message: 'Sync completed', data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;