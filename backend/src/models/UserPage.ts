import mongoose from 'mongoose';

const SectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'gallery', 'image', 'split_text_gallery'], // split_text_gallery doit être là aussi
    required: true
  },
  content: String,
  albumIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  imageUrl: String,
  order: { type: Number, default: 0 }
}, { _id: true });

const UserPageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },

  coverImage: String, // <--- AJOUTER CECI (pour stocker le nom du fichier image)

  isPublished: { type: Boolean, default: false },
  showOnBlog: { type: Boolean, default: false },
  sections: [SectionSchema],
  seoDescription: String
}, { timestamps: true });

UserPageSchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.model('UserPage', UserPageSchema);
