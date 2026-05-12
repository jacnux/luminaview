// backend/src/models/Album.ts
import mongoose from 'mongoose';

export interface IAlbum extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  isPublic: boolean;
  isFeatured: boolean;
  coverImage?: string;
  isVirtual: boolean;
  virtualFilter?: 'tag' | 'date' | null;
  filterValue?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  sortOrder: 'date_desc' | 'date_asc' | 'manual';
  tags?: string[];
  createdAt: Date;
}

const AlbumSchema = new mongoose.Schema<IAlbum>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  isPublic: { type: Boolean, default: true },

  // --- NOUVEAU : Pour le Portfolio ---
  isFeatured: { type: Boolean, default: false },
  coverImage: String, // Stocke le filename de la couverture (ex: "1772987727758.jpg")

  // --- Champs pour les albums virtuels ---
  isVirtual: { type: Boolean, default: false },
  virtualFilter: {
      type: String,
      enum: ['tag', 'date', null],
      default: null
  },
  filterValue: { type: String, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },

  // --- NOUVEAU : Tags pour les albums virtuels ---
  tags: [{ type: String }],

  createdAt: { type: Date, default: Date.now },

  // Options de tri
  sortOrder: { type: String, enum: ['date_desc', 'date_asc', 'manual'], default: 'date_desc' }

},

{ timestamps: true });


export default mongoose.model<IAlbum>('Album', AlbumSchema);
