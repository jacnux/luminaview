import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { sendNewPostNotification } from './services/newsletterService';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- DATABASES ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/helioscope_blogs';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Blog MongoDB Connected'))
  .catch(err => console.error('Blog MongoDB Error:', err));

const mainConn = mongoose.createConnection(process.env.MAIN_MONGO_URI || 'mongodb://mongo:27017/luminaview');

const MainUser = mainConn.model('User', new mongoose.Schema({
  name: String, email: String, avatar: String, bio: String, isAdmin: Boolean }, { collection: 'users' }));

// --- MODIFICATION ICI : Nouveau Modèle pour les UserPages ---
// On pointe vers la collection 'userpages' créée par ton appli principale
const UserPageSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  slug: String,
  coverImage: String,
  isPublished: Boolean,
  showOnBlog:Boolean
  // On ne charge pas tout le contenu 'sections' pour alléger la liste des galéries
}, { collection: 'userpages' });
const MainUserPage = mainConn.model('UserPage', UserPageSchema);

// Ancien modèle (on peut le commenter ou le supprimer si tu n'utilises plus l'ancien système)
/*
const PageSchema = new mongoose.Schema({ ... }, { collection: 'pages' });
const MainPage = mainConn.model('Page', PageSchema);
*/
// -------------------------------------------------------------

// --- MODELS (Post, Comment, etc...) ---
// ... (Laisse le reste des modèles Post, Comment, NewsletterSubscriber exactement comme ils sont) ...
const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  slug: String,
  blogSlug: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', PostSchema);

const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Comment = mongoose.model('Comment', CommentSchema);

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  blogSlug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);


// --- MIDDLEWARE & EMAIL (Laisse tel quel) ---
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
};

const transporterOptions: any = {
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
};
if (process.env.SMTP_USER && process.env.SMTP_USER.length > 0) {
  transporterOptions.auth = { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS };
}
const transporter = nodemailer.createTransport(transporterOptions);


// --- ROUTES ---


// GET USER (MODIFIE POUR FILTRER PAR SHOWONBLOG)
app.get('/api/user/:slug', async (req: Request, res: Response) => {
  try {
    // 1. Trouver l'utilisateur
    const user = await MainUser.findOne({ name: { $regex: new RegExp(`^${req.params.slug}$`, "i") } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // 2. Chercher les UserPages avec les BONS filtres
    const pages = await MainUserPage.find({
      userId: user._id,
      showOnBlog: true        // Doit avoir le drapeau Blog activé
    }).select('title slug coverImage'); // On récupère titre et slug

    // 3. Renvoyer
    res.json({
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      showcaseAlbums: pages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur' });
  }
});

// --- POSTS ROUTES (Laisse tel quel) ---
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const { blog } = req.query;
    const posts = await Post.find(blog ? { blogSlug: blog } : {}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

app.get('/api/posts/:slug', async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(post);
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

app.post('/api/posts', authMiddleware, async (req: Request, res: Response) => {
  console.log("[API] Demande de création d'article reçue");
  try {
    const { title, content, slug, blogSlug } = req.body;
    if (!blogSlug) return res.status(400).json({ error: 'Blog Slug manquant' });
    const newPost = new Post({ title, content, slug, blogSlug });
    await newPost.save();
    console.log(`[API] Article créé. Vérification abonnés pour ${blogSlug}...`);
    const subscribers = await NewsletterSubscriber.find({ blogSlug });
    console.log(`[NEWSLETTER] ${subscribers.length} abonnés trouvés.`);
    if (subscribers.length > 0) {
        await sendNewPostNotification(subscribers, newPost);
    }
    res.status(201).json(newPost);
  } catch (error) {
    console.error("[API] ERREUR Création:", error);
    res.status(500).json({ error: 'Erreur création' });
  }
});

app.put('/api/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, slug, blogSlug } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title, content, slug, blogSlug }, { new: true });
    if (!updatedPost) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(updatedPost);
  } catch (error) { res.status(500).json({ error: 'Erreur maj' }); }
});

app.delete('/api/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supprimé' });
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// --- CONTACT (MODIFIE LEGÈREMENT) ---
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { blogSlug, name, email, message } = req.body;

    // Pour le contact, on cherche directement l'utilisateur par son nom (blogSlug)
    let owner = await MainUser.findOne({ name: { $regex: new RegExp(`^${blogSlug}$`, "i") } });

    if (!owner || !owner.email) return res.status(404).json({ error: 'Destinataire introuvable' });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: owner.email,
      subject: `Nouveau message de ${name}`,
      html: `<p>${message}</p><p>De: ${name} (${email})</p>`
    });
    res.json({ message: 'Message envoyé' });
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// --- COMMENTS (Laisse tel quel) ---
app.post('/api/comments', async (req: Request, res: Response) => {
  try {
    const { postId, name, content } = req.body;
    await new Comment({ postId, name, email: 'anonyme', content }).save();
    res.status(201).json({ message: 'En attente' });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/comments/post/:postId', async (req: Request, res: Response) => {
  try { res.json(await Comment.find({ postId: req.params.postId, isApproved: true })); }
  catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/comments/pending', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const user = await MainUser.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let query: any = { isApproved: false };
    if (!user.isAdmin) {
        const userPosts = await Post.find({ blogSlug: user.name.toLowerCase() }).select('_id');
        const postIds = userPosts.map(p => p._id);
        query.postId = { $in: postIds };
    }
    const comments = await Comment.find(query).populate('postId', 'title');
    res.json(comments);
  } catch (e) {
    console.error("[COMMENTS] Erreur:", e);
    res.status(500).json({ error: 'Error' });
  }
});

app.patch('/api/comments/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try { res.json(await Comment.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true })); }
  catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.delete('/api/comments/:id', authMiddleware, async (req: Request, res: Response) => {
  try { await Comment.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { res.status(500).json({ error: 'Error' }); }
});

// --- NEWSLETTER ---
app.post('/api/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, blogSlug } = req.body;
    if (await NewsletterSubscriber.findOne({ email, blogSlug })) return res.json({ message: 'Exists' });
    await new NewsletterSubscriber({ email, blogSlug }).save();
    res.status(201).json({ message: 'OK' });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Blog Engine running on port ${PORT}`));
