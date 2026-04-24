const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);
    const [pendingCount, inProgressCount, resolvedCount] = await Promise.all([
      Complaint.countDocuments({ status: 'PENDING' }),
      Complaint.countDocuments({ status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ status: 'RESOLVED' }),
    ]);
    res.json({
      success: true,
      data: complaints,
      counts: { PENDING: pendingCount, IN_PROGRESS: inProgressCount, RESOLVED: resolvedCount },
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, location } = req.body;
    if (!title || !description || !location)
      return res.status(400).json({ success: false, message: 'Title, description, and location are required' });
    const complaint = await Complaint.create({
      title, description, location,
      submittedBy: req.user.name,
      submittedByUserId: req.user._id,
    });
    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    complaint.status = status;
    if (status === 'RESOLVED') {
      complaint.resolvedAt = new Date();
      complaint.resolvedBy = req.user.name;
    }
    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;