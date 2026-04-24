const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    submittedBy: { type: String, required: true, trim: true },
    submittedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'], default: 'PENDING' },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
  },
  { timestamps: true }
);

complaintSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'RESOLVED') {
    this.resolvedAt = new Date();
  }
  next();
});

complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);