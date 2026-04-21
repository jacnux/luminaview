import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import Page from '../models/Page';
import { authenticateToken } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// --- CONFIGURATION MULTER POUR HERO IMAGE ---
const heroStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // On utilise le même dossier que les autres uploads
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Nom du fichier unique : hero-timestamp.ext
    cb(null, 'hero-' + Date.now() + path.extname(file.originalname));
  }
});

// C'est ici que la variable est définie
const uploadHero = multer({ storage: heroStorage });
// ---------------------------------------------


// --- ROUTES ---

// GET : Lister mes pages
router.get('/mine', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pages = await Page.find({ userId: req.user.userId })
      .populate('showcaseAlbums', 'title coverImage isPublic');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération pages' });
  }
});

// POST : Créer une nouvelle page
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, slug, bio, showcaseAlbums, background, showBrand, socialLinks } = req.body;

    const existing = await Page.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Cet identifiant URL est déjà utilisé.' });
    }

    const page = new Page({
      userId: req.user.userId,
      title,
      slug,
      bio,
      showcaseAlbums,
      background,
      showBrand,
      socialLinks
    });

    await page.save();
    res.status(201).json(page);
  } catch (error) {
    console.error("Erreur création page:", error);
    res.status(500).json({ error: 'Erreur création page' });
  }
});

// --- NOUVELLE ROUTE : UPLOAD HERO IMAGE ---
// On utilise la variable uploadHero définie plus haut
router.post('/upload-hero/:id', authenticateToken, uploadHero.single('hero'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });

    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page introuvable' });
    if (page.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    page.heroImage = req.file.filename;
    await page.save();

    res.json({ filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// PUT : Modifier une page
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    //const { title, slug, bio, showcaseAlbums, isPublic, background, showBrand, socialLinks, heroImage } = req.body;
    const { title, slug, bio, showcaseAlbums, isPublic, background, showBrand, socialLinks, heroImage, showOnBlog } = req.body;

    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page introuvable' });
    if (page.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    page.title = title || page.title;
    page.slug = slug || page.slug;
    page.bio = bio;
    page.showcaseAlbums = showcaseAlbums;
    page.background = background || page.background;
    page.showBrand = showBrand;
    page.socialLinks = socialLinks;
    if (showOnBlog !== undefined) page.showOnBlog = showOnBlog;
    // Pour la suppression manuelle de l'image si besoin
    if (heroImage !== undefined) page.heroImage = heroImage;

    if (isPublic !== undefined) {
        page.isPublic = isPublic;
    }

    await page.save();
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// DELETE : Supprimer une page
 router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: 'Page introuvable' });
    if (page.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    await page.deleteOne();
    res.json({ message: 'Page supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

// GET : Page Publique
/*router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublic: true })
      .populate('userId', 'name avatar')
      .populate({
          path: 'showcaseAlbums',
          match: { isPublic: true },
          select: 'title description coverImage'
      });

    if (!page) return res.status(404).json({ error: 'Page introuvable' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});*/

// GET : Page Publique (avec fallback sur le nom d'utilisateur)

// GET : Page Publique
router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // 1. On cherche par Slug
    let page = await Page.findOne({ slug, isPublic: true })
      .populate('userId', 'name avatar')
      .populate({
          path: 'showcaseAlbums',
          match: { isPublic: true },
          select: 'title description coverImage'
      });

    // 2. Fallback : on cherche par nom d'utilisateur
    if (!page) {
        // Sécurité : on vérifie que le slug existe
        if(slug) {
            const user = await User.findOne({
                name: { $regex: new RegExp(`^${slug}$`, 'i') }
            });

            if (user) {
                page = await Page.findOne({ userId: user._id, isPublic: true })
                  .populate('userId', 'name avatar')
                  .populate({
                      path: 'showcaseAlbums',
                      match: { isPublic: true },
                      select: 'title description coverImage'
                  });
            }
        }
    }

    if (!page) return res.status(404).json({ error: 'Page introuvable' });
    res.json(page);
  } catch (error) {
    console.error("Erreur PublicPage:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
export default router;
