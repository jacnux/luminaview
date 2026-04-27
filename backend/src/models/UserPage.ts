import mongoose from 'mongoose';

// Schéma pour une section (un bloc de contenu à l'intérieur de la page)
const SectionSchema = new mongoose.Schema({
  type: {
    type: String,
    // On autorise 3 types de blocs pour l'instant
    enum: ['text', 'gallery', 'image'],
    required: true
  },
  // Contenu textuel (pour le type 'text')
  content: String,
  // Liste d'ID d'albums (pour le type 'gallery')
  albumIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
  // URL d'une image (pour le type 'image')
  imageUrl: String,
  // Ordre d'affichage (utile si on veut trier plus tard)
  order: { type: Number, default: 0 }
}, { _id: true }); // _id: true permet d'avoir un ID unique pour chaque bloc

// Schéma principal de la page personnelle
const UserPageSchema = new mongoose.Schema({
  // Lien avec le propriétaire de la page
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Titre de la page (ex: "Mes Tarifs")
  title: { type: String, required: true },

  // Identifiant pour l'URL (ex: "mes-tarifs" donnera /portfolio/jac/mes-tarifs)
  slug: { type: String, required: true },

  // Statut de publication
  isPublished: { type: Boolean, default: false },

  // Le contenu de la page est un tableau de sections
  sections: [SectionSchema],

  // Pour le SEO (optionnel)
  seoDescription: String
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

// Index composé : Un utilisateur ne peut pas avoir deux pages avec le même slug.
// Exemple: Jac ne peut pas avoir deux pages appelées "contact".
UserPageSchema.index({ userId: 1, slug: 1 }, { unique: true });

export default mongoose.model('UserPage', UserPageSchema);
