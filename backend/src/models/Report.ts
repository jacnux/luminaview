import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['album', 'page'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Report', ReportSchema);
