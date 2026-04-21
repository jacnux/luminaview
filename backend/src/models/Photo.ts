import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoto extends Document {
  albumId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Le propriétaire
  filename: string;
  index: number;
  title: string;
  description: string;
  tags: string[];
  createdAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  albumId: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  index: { type: Number, required: true, default: 0 },
  title: { type: String, required: true, default: 'Sans titre' },
  description: { type: String, default: '' },
  tags: [{ type: String }],
  size: { type: Number, default: 0 }, // Taille du fichier en octets
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
