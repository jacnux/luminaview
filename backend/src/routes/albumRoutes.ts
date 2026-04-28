import express, { Request, Response } from 'express';
import Album from '../models/Album';
import Photo from '../models/Photo';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';
import jwt from 'jsonwebtoken'; // Importé pour vérification manuelle

const router = express.Router();

// --- POST : Créer un nouvel album/galerie ---
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { title, description, isPublic, isVirtual, virtualFilter } = req.body;
    let { filterValue } = req.body;

    if (filterValue) {
        filterValue = filterValue.toLowerCase();
    }

    const newAlbum = new Album({
      userId: req.user.userId,
      title,
      description,
      isPublic,
      isVirtual,
      virtualFilter,
      filterValue
    });

    await newAlbum.save();
    res.status(201).json(newAlbum);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur création album' });
  }
});

// --- GET : Mes Albums (Avec auto-cover pour Virtuels) ---
router.get('/my/albums', authenticateToken, async (req: Request, res: Response) => {
  try {
    let albums = await Album.find({ userId: req.user.userId }).sort({ createdAt: -1 }).lean();

    const updatedAlbums = await Promise.all(albums.map(async (album) => {
      // On vérifie aussi filterValue pour gérer les anciens albums
      if ((album.isVirtual || album.filterValue) && !album.coverImage && album.virtualFilter === 'tag' && album.filterValue) {

        // 1. On récupère les tags
        const rawTags = album.filterValue.split(',').map(t => t.trim()).filter(t => t);

        // 2. On sépare positifs et négatifs
        const positiveTags = rawTags.filter(t => !t.startsWith('-'));
        const negativeTags = rawTags.filter(t => t.startsWith('-')).map(t => t.substring(1));

        if (positiveTags.length > 0) {

          // 3. Construction de la requête
          const query: any = { tags: { $all: positiveTags } }; // CORRECTION ICI : $all au lieu de $in

          // CORRECTION SÉCURITÉ : Limiter aux photos de l'utilisateur connecté
          query.userId = req.user.userId;

          // On applique aussi l'exclusion pour la couverture
          if (negativeTags.length > 0) {
             query.tags.$nin = negativeTags;
          }

          const photo = await Photo.findOne(query)
            .sort({ createdAt: -1 })
            .select('filename');

          if (photo) {
            album.coverImage = photo.filename;
            await Album.updateOne({ _id: album._id }, { coverImage: photo.filename });
          }
        }
      }
      return album;
    }));

    res.json(updatedAlbums);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération albums' });
  }
});

// --- GET : Photos d'un album (Support Publique + Admin) ---
router.get('/photos/:id', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    // Logique d'accès (inchangée)
    if (!album.isPublic) {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Accès non autorisé (token requis)' });
      try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as any;
        const isAdmin = decoded.isAdmin === true;
        const isOwner = decoded.userId === album.userId.toString();
        if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Accès interdit' });
      } catch (err) {
        return res.status(403).json({ error: 'Token invalide ou expiré' });
      }
    }

    // Récupération des photos
    let photos;

    // Définition des champs à récupérer (IMPORTANT pour le titre et la description)
    const fieldsToSelect = 'filename title description createdAt index tags';

    if (album.virtualFilter === 'tag' && album.filterValue) {
      const rawTags = album.filterValue.split(',').map(t => t.trim()).filter(t => t);
      const positiveTags = rawTags.filter(t => !t.startsWith('-'));
      const negativeTags = rawTags.filter(t => t.startsWith('-')).map(t => t.substring(1));

      const query: any = {};
      const tagsCondition: any = {};

      if (positiveTags.length > 0) tagsCondition.$all = positiveTags;
      if (negativeTags.length > 0) tagsCondition.$nin = negativeTags;

      if (Object.keys(tagsCondition).length > 0) {
        query.tags = tagsCondition;
        // CORRECTION SÉCURITÉ CRITIQUE :
        // On ajoute l'ID du propriétaire de l'album à la requête
        query.userId = album.userId;

        // AJOUT .select() ICI
        photos = await Photo.find(query).select(fieldsToSelect).sort({ createdAt: -1 });
      } else {
        photos = [];
      }

    } else {
      // AJOUT .select() ICI AUSSI
      photos = await Photo.find({ albumId: req.params.id }).select(fieldsToSelect).sort({ createdAt: -1 });
    }

    res.json(photos);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération photos' });
  }
});


// --- GET : Portfolio Public ---
router.get('/portfolio/:username', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${req.params.username}$`, "i") }
    // AJOUT DE 'email'
    }).select('name email avatar bio bannerImage portfolioIntro servicesDescription');

    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

    const albums = await Album.find({
      userId: user._id,
      isPublic: true,
      isFeatured: true
    }).sort({ createdAt: -1 });

    res.json({ user, albums });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// --- GET : Détail d'un album (Support Publique + Admin) ---
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    if (!album.isPublic) {
       const authHeader = req.headers['authorization'];
       const token = authHeader && authHeader.split(' ')[1];
       if (!token) return res.status(401).json({ error: 'Accès non autorisé' });
       try {
         const secret = process.env.JWT_SECRET || 'default_secret';
         const decoded = jwt.verify(token, secret) as any;

         const isAdmin = decoded.isAdmin === true;
         const isOwner = decoded.userId === album.userId.toString();

         if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Accès interdit' });
         }
       } catch (err) {
         return res.status(403).json({ error: 'Token invalide' });
       }
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// --- PUT : Modifier un album ---
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    // AJOUT de isVirtual ici
    const { title, description, isPublic, coverImage, virtualFilter, filterValue, isVirtual } = req.body;

    // AJOUT de isVirtual dans updateData
    const updateData: any = { title, description, isPublic, coverImage, isVirtual };

    if (virtualFilter !== undefined) updateData.virtualFilter = virtualFilter;
    if (filterValue !== undefined) updateData.filterValue = filterValue;

    const updated = await Album.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Album non trouvé ou non autorisé' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// --- PATCH : Toggle Visibilité ---
router.patch('/:id/toggle-visibility', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    album.isPublic = !album.isPublic;
    await album.save();
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur changement visibilité' });
  }
});

// PATCH : Mettre en avant sur le Portfolio
router.patch('/:id/toggle-featured', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    album.isFeatured = !album.isFeatured;
    await album.save();
    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// --- DELETE : Supprimer un album ---
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    await album.deleteOne();
    res.json({ message: 'Album supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

export default router;
