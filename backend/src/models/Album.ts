// 24 Février 2026
// version 7.0

// backend/src/models/Album.ts
import mongoose from 'mongoose';

const AlbumSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },

  // --- NOUVEAU CHAMP ---
  isPublic: { type: Boolean, default: true },

  // Pour les albums virtuels
  isVirtual: { type: Boolean, default: false },
  virtualFilter: {
      type: String,
      enum: ['tag', 'date', null], // CORRECTION ICI
      default: null
  },
  filterValue: { type: String, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },

  // --- NOUVEAU CHAMP V7.0 ---
 // Options : 'date_desc' (Récent), 'date_asc' (Ancien), 'manual' (Manuel)
 sortOrder: { type: String, enum: ['date_desc', 'date_asc', 'manual'], default: 'date_desc' }

}, { timestamps: true });


export default mongoose.model('Album', AlbumSchema);
