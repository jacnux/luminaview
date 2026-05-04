/* import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['album', 'page', 'user_page'],
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
*/
import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['album', 'user_page', 'user'], // On garde 'user_page' pour le nouveau système
    required: true
  },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', ReportSchema);
