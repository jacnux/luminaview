import { Router, Request, Response } from 'express';
import UserPage from '../models/UserPage';
import User from '../models/User';
import Photo from '../models/Photo';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ==========================================
// PARTIE PRIVÉE (A METTRE EN PREMIER)
// ==========================================

// 1. Lister MES pages (pour le dashboard)
router.get('/my/list', authenticateToken, async (req: Request, res: Response) => {
  try {
    const pages = await UserPage.find({ userId: req.user.userId })
      .select('title slug isPublished createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 2. Récupérer une page spécifique pour édition
router.get('/my/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const page = await UserPage.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate('sections.albumIds', 'title');
    if (!page) return res.status(404).json({ error: 'Page non trouvée' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 3. Créer ou Mettre à jour une page
router.post('/my/save', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id, title, slug, sections, isPublished } = req.body;
    const userId = req.user.userId;

    if (!title || !slug) return res.status(400).json({ error: 'Titre et slug obligatoires' });

    // Nettoyage des sections
    const cleanSections = sections.map((s: any) => {
      const { _id, ...rest } = s;
      return rest;
    });

    const cleanSlug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    if (id) {
      // UPDATE
      const updated = await UserPage.findOneAndUpdate(
        { _id: id, userId },
        { title, slug: cleanSlug, sections: cleanSections, isPublished },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Page non trouvée' });
      res.json(updated);
    } else {
      // CREATE
      const newPage = new UserPage({ userId, title, slug: cleanSlug, sections: cleanSections, isPublished });
      await newPage.save();
      res.status(201).json(newPage);
    }
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ error: 'Ce slug existe déjà.' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 4. Supprimer une page
router.delete('/my/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = await UserPage.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ error: 'Page non trouvée' });
    res.json({ message: 'Page supprimée' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ==========================================
// PARTIE PUBLIQUE
// ==========================================

// 5. Lister les pages publiques d'un utilisateur
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ name: { $regex: new RegExp(`^${req.params.username}$`, "i") } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const pages = await UserPage.find({ userId: user._id, isPublished: true }).select('title slug');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 6. Voir une page spécifique
// ... début du fichier ...

// 5. Voir une page spécifique
router.get('/:username/:slug', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ name: { $regex: new RegExp(`^${req.params.username}$`, "i") } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const page = await UserPage.findOne({ userId: user._id, slug: req.params.slug, isPublished: true })
      .populate({
          path: 'sections.albumIds',
          model: 'Album',
          select: 'title coverImage isVirtual virtualFilter filterValue startDate endDate'
      });

    if (!page) return res.status(404).json({ error: 'Page non trouvée' });

    const pageObject = page.toObject();

    for (const section of pageObject.sections) {
        if (section.type === 'gallery' && section.albumIds) {
            for (const album of section.albumIds) {
                let photos: any[] = [];

                // Sélection des champs : filename, title ET description
                const selectFields = 'filename title description';

                if (album.isVirtual) {
                    let query: any = {};
                    if (album.virtualFilter === 'tag' && album.filterValue) {
                        const tagsList = album.filterValue.split(',').map((t: string) => t.trim());
                        query.tags = { $all: tagsList };
                    } else if (album.virtualFilter === 'date') {
                        query.createdAt = { $gte: album.startDate, $lte: album.endDate };
                    }
                    if (Object.keys(query).length > 0) {
                        photos = await Photo.find(query).select(selectFields).sort({ createdAt: -1 });
                    }
                } else {
                    photos = await Photo.find({ albumId: album._id }).select(selectFields).sort({ index: 1 });
                }

                // IMPORTANT : On assigne le tableau d'objets complet, pas juste les filenames
                album.photos = photos;
            }
        }
    }
    res.json(pageObject);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



export default router;
