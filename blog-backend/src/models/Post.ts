import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  blogSlug: { type: String, required: true, index: true }, // Pour séparer les blogs
  title: { type: String, required: true },
  slug: { type: String, required: true }, // Pour l'URL de l'article
  content: { type: String, required: true },
  excerpt: String,
  coverImage: String, // URL de l'image (hébergée sur Helioscope)
  author: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Post', PostSchema);
