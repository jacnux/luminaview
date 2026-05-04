import mongoose from 'mongoose';

const PageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  bio: { type: String, default: '' },
  showcaseAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  isPublic: { type: Boolean, default: true },
  background: { type: String, default: 'bg-black' },

  // --- NOUVEAUX CHAMPS SPRINT 3 ---
  // --- NOUVEAU CHAMP ---
  heroImage: { type: String, default: null }, // Stocke le nom du fichier (ex: 12345.jpg)
  // Marque blanche
  showBrand: { type: Boolean, default: true },
  // A afiicher sur le blog
  showOnBlog: { type: Boolean, default: false },
  // Réseaux Sociaux & Contact
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    website: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' }
  }
  // --------------------------------

}, { timestamps: true });

export default mongoose.model('Page', PageSchema);
