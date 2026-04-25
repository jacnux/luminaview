import express, { Request, Response } from 'express';
import User from '../models/User';
import Album from '../models/Album';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// --- CONFIGURATION MULTER (Avatar + Banner) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // On préfixe le fichier selon son type (avatar-... ou banner-...)
    const prefix = file.fieldname === 'banner' ? 'banner-' : 'avatar-';
    cb(null, prefix + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. GET : Lister tous les utilisateurs (ADMIN)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!(req as any).user?.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération utilisateurs' });
  }
});

// 2. GET : Albums d'un utilisateur spécifique (ADMIN)
router.get('/admin/:id/albums', authenticateToken, async (req: Request, res: Response) => {
  if (!(req as any).user?.isAdmin) return res.status(403).json({ error: 'Accès refusé' });

  try {
    const albums = await Album.find({ userId: req.params.id }).select('title coverImage description isPublic isVirtual');
    res.json(albums);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération albums' });
  }
});

// 3. GET MON PROFIL (Connecté)
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error("Erreur GET /me:", error);
    res.status(500).json({ error: 'Erreur récupération profil' });
  }
});

// 4. PUT METTRE A JOUR PROFIL
router.put('/me', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    // Récupération des champs textuels
    const { bio, showcaseAlbums, portfolioIntro, servicesDescription } = req.body;

    const updates: any = {};

    // Mise à jour des champs texte
    if (bio !== undefined) updates.bio = bio;

    // --- AJOUT INDISPENSABLE ---
    if (portfolioIntro !== undefined) updates.portfolioIntro = portfolioIntro;
    if (servicesDescription !== undefined) updates.servicesDescription = servicesDescription;
    // ---------------------------

    // Gestion des fichiers uploadés
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files['avatar']) {
      updates.avatar = files['avatar'][0].filename;
    }
    if (files && files['banner']) {
      updates.bannerImage = files['banner'][0].filename;
    }

    if (showcaseAlbums) updates.showcaseAlbums = JSON.parse(showcaseAlbums);

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur mise à jour profil' });
  }
});

// 4. PUT METTRE A JOUR PROFIL (Gestion Avatar ET Banner)
// On utilise .fields pour accepter plusieurs types de fichiers



/*router.put('/me', authenticateToken, upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {


    const updates: any = {};

    if (bio !== undefined) updates.bio = bio;

    // Gestion des fichiers uploadés
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files && files['avatar']) {
      updates.avatar = files['avatar'][0].filename;
    }
    if (files && files['banner']) {
      updates.bannerImage = files['banner'][0].filename;
    }

    if (showcaseAlbums) updates.showcaseAlbums = JSON.parse(showcaseAlbums);

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur mise à jour profil' });
  }
}); */

// 5. GET PROFIL PUBLIC
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name bio avatar bannerImage showcaseAlbums createdAt') // Ajout de bannerImage
      .populate({
        path: 'showcaseAlbums',
        match: { isPublic: true }
      });

    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

export default router;
