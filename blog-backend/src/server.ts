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

const PageSchema = new mongoose.Schema({
  slug: String,
  userId: mongoose.Schema.Types.ObjectId,
  heroImage: String,
  title: String,
  isPublic: Boolean,
  showOnBlog: Boolean
}, { collection: 'pages' });
const MainPage = mainConn.model('Page', PageSchema);

// --- MODELS ---
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

// --- MIDDLEWARE ---
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

// --- EMAIL ---
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
app.get('/', (req, res) => res.send('Blog Engine API Running'));

// GET POSTS
app.get('/api/posts', async (req: Request, res: Response) => {
  try {
    const { blog } = req.query;
    const posts = await Post.find(blog ? { blogSlug: blog } : {}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// GET POST DETAIL
app.get('/api/posts/:slug', async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(post);
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// CREATE POST
app.post('/api/posts', authMiddleware, async (req: Request, res: Response) => {
  console.log("[API] Demande de création d'article reçue"); // LOG 1

  try {
    const { title, content, slug, blogSlug } = req.body;
    if (!blogSlug) return res.status(400).json({ error: 'Blog Slug manquant' });

    const newPost = new Post({ title, content, slug, blogSlug });
    await newPost.save();

    console.log(`[API] Article créé. Vérification abonnés pour ${blogSlug}...`); // LOG 2

    // Notification
    const subscribers = await NewsletterSubscriber.find({ blogSlug });

    console.log(`[NEWSLETTER] ${subscribers.length} abonnés trouvés.`); // LOG 3

    if (subscribers.length > 0) {

      // On appelle la fonction créée dans l'autre fichier
        await sendNewPostNotification(subscribers, newPost);

    }

    res.status(201).json(newPost);
  } catch (error) {
    console.error("[API] ERREUR Création:", error);
    res.status(500).json({ error: 'Erreur création' });
  }
});

// UPDATE POST (LA ROUTE MANQUANTE)
app.put('/api/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, slug, blogSlug } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, { title, content, slug, blogSlug }, { new: true });
    if (!updatedPost) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(updatedPost);
  } catch (error) { res.status(500).json({ error: 'Erreur maj' }); }
});

// DELETE POST
app.delete('/api/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supprimé' });
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// USER
app.get('/api/user/:slug', async (req: Request, res: Response) => {
  try {
    const user = await MainUser.findOne({ name: { $regex: new RegExp(`^${req.params.slug}$`, "i") } });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const pages = await MainPage.find({ userId: user._id, showOnBlog: true }).select('title slug heroImage');
    res.json({ name: user.name, avatar: user.avatar, bio: user.bio, showcaseAlbums: pages });
  } catch (error) { res.status(500).json({ error: 'Erreur' }); }
});

// CONTACT (CORRIGÉ)
app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const { blogSlug, name, email, message } = req.body;

    let owner = null;
    const page = await MainPage.findOne({ slug: blogSlug });
    if (page && page.userId) {
        owner = await MainUser.findById(page.userId);
    }
    if (!owner) {
        owner = await MainUser.findOne({ name: { $regex: new RegExp(`^${blogSlug}$`, "i") } });
    }

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

// COMMENTS
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
    // 1. On récupère l'ID du token
    const userId = (req as any).user?.userId;
    // console.log("[DEBUG] Recherche de l'utilisateur ID:", userId);

    // 2. On cherche l'utilisateur dans la base principale
    const user = await MainUser.findById(userId);

    if (!user) {
    //  console.log("[DEBUG] Utilisateur NON TROUVÉ dans la base principale");
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. On vérifie son statut admin
    // console.log(`[DEBUG] Utilisateur trouvé: ${user.name}, Admin: ${user.isAdmin}`);

    let query: any = { isApproved: false };

    // Si PAS admin, on filtre
    if (!user.isAdmin) {
      //  console.log("[DEBUG] Mode 'Auteur': Filtrage par blogSlug");
        const userPosts = await Post.find({ blogSlug: user.name.toLowerCase() }).select('_id');
        const postIds = userPosts.map(p => p._id);
        query.postId = { $in: postIds };
    } else {
        console.log("[DEBUG] Mode 'Admin': Affichage de tous les commentaires");
    }

    const comments = await Comment.find(query).populate('postId', 'title');
    // console.log(`[DEBUG] Commentaires trouvés: ${comments.length}`);

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

// NEWSLETTER
app.post('/api/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, blogSlug } = req.body;
    if (await NewsletterSubscriber.findOne({ email, blogSlug })) return res.json({ message: 'Exists' });
    await new NewsletterSubscriber({ email, blogSlug }).save();
    res.status(201).json({ message: 'OK' });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// Remplace la dernière ligne par celle-ci :
app.listen(PORT, '0.0.0.0', () => console.log(`Blog Engine running on port ${PORT}`));
