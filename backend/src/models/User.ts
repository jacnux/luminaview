import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  portfolioIntro: { type: String, default: '' }, // NOUVEAU : Texte d'intro du portfolio
  servicesDescription: { type: String, default: '' },

  bannerImage: {
    type: String
  },

  isAdmin: {
    type: Boolean,
    default: false
  },
  quotaLimit: {
    type: Number,
    default: 1 * 1024 * 1024 * 1024
  }, // 1 GB par défaut
  quotaUsed: {
    type: Number,
    default: 0
  },

  // --- NOUVEAUX CHAMPS POUR LA VERIFICATION EMAIL ---
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date
  // -------------------------------------------------

}, { timestamps: true });

export default mongoose.model('User', UserSchema);

/*import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  quotaLimit: { type: Number, default: 1073741824 },
  quotaUsed: { type: Number, default: 0 },

  // --- NOUVEAUX CHAMPS V6.0 ---
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' }, // Nom du fichier avatar
  showcaseAlbums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }], // Liste des albums à afficher

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);*/
