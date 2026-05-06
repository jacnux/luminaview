import { Request, Response } from 'express';
import Photo from '../models/Photo';
import Album from '../models/Album';

// --- GET ALL TAGS (Pour l'autocomplétion) ---
export const getAllTags = async (req: Request, res: Response) => {
  try {
    const tags = await Photo.distinct('tags');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération tags' });
  }
};

// --- GET PHOTOS BY ALBUM (Support Galerie Virtuelle) ---
export const getAlbumPhotos = async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params.id);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    let photos;

    // LOGIQUE V6 : Si c'est virtuel, on cherche par tags
    if (album.isVirtual && album.tags && album.tags.length > 0) {
      photos = await Photo.find({
        tags: { $in: album.tags },
        userId: album.userId   // ✅ scope à l'owner de l'album
         }).sort({ createdAt: -1 });
    } else {
      // Sinon, on cherche par albumId (classique)
      photos = await Photo.find({ albumId: req.params.id });
    }

    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération photos' });
  }
};

// --- MOVE PHOTO (Outils) ---
export const movePhoto = async (req: Request, res: Response) => {
    try {
        const { targetAlbumId } = req.body;
        const photo = await Photo.findByIdAndUpdate(req.params.id, { albumId: targetAlbumId }, { new: true });
        res.json(photo);
    } catch (error) {
        res.status(500).json({ error: 'Erreur déplacement' });
    }
};

// --- DELETE PHOTO ---
export const deletePhoto = async (req: Request, res: Response) => {
    try {
        await Photo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur suppression' });
    }
};

// --- UPDATE PHOTO ---
export const updatePhoto = async (req: Request, res: Response) => {
    try {
        const photo = await Photo.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(photo);
    } catch (error) {
        res.status(500).json({ error: 'Erreur mise à jour' });
    }
};
