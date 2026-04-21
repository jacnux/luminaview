import { Request, Response } from 'express';
import Album from '../models/Album';
import Photo from '../models/Photo';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuration Multer pour l'upload de couverture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- CREATE ALBUM ---
export const createAlbum = async (req: Request, res: Response) => {
  try {
    const { title, description, isVirtual, virtualFilter, filterValue, startDate, endDate } = req.body;
    const userId = (req as any).user.userId;

    let coverImage = req.file ? req.file.filename : undefined;

    const albumData: any = {
      userId,
      title,
      description,
      coverImage,
      isVirtual: isVirtual === 'true' || isVirtual === true,
      virtualFilter: isVirtual ? virtualFilter : null,
      filterValue: isVirtual ? filterValue : null,
      startDate: isVirtual && virtualFilter === 'date' ? startDate : null,
      endDate: isVirtual && virtualFilter === 'date' ? endDate : null,
    };

    const album = new Album(albumData);
    await album.save();

    // LOGIQUE AUTO-COVER POUR ALBUM VIRTUEL
    if (album.isVirtual) {
      let firstPhoto: any = null;

      if (album.virtualFilter === 'tag' && album.filterValue) {
        const regex = new RegExp(`^${album.filterValue}$`, 'i');
        firstPhoto = await Photo.findOne({ tags: regex }).sort({ createdAt: -1 });
      } else if (album.virtualFilter === 'date') {
        const query: any = {};
        if (album.startDate) query.createdAt = { ...query.createdAt, $gte: new Date(album.startDate) };
        if (album.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(album.endDate) };
        firstPhoto = await Photo.findOne(query).sort({ createdAt: -1 });
      }

      if (firstPhoto) {
        album.coverImage = firstPhoto.filename;
        await album.save();
      }
    }

    res.status(201).json(album);
  } catch (error) {
    console.error("Erreur createAlbum:", error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'album' });
  }
};


// --- GET PHOTOS (AVEC TRI V7 + GALERIES VIRTUELLES) ---
export const getAlbumPhotos = async (req: Request, res: Response) => {
  try {
    const { albumId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(albumId)) {
        return res.status(400).json({ error: 'ID invalide' });
    }

    const album = await Album.findById(albumId);
    if (!album) {
      return res.status(404).json({ error: 'Album introuvable' });
    }

    let photos: any[] = [];

    if (album.isVirtual) {
      // --- GALERIE VIRTUELLE ---
      const query: any = { userId: album.userId };

      // 1. Logique par Tags (Prioritaire - Nouvelle méthode)
      // Si l'album a un tableau de tags, on cherche les photos qui ont AU MOINS UN de ces tags
      if (album.tags && album.tags.length > 0) {
        query.tags = { $in: album.tags };
        photos = await Photo.find(query).sort({ createdAt: -1 });
      }
      // 2. Sinon, ancienne logique par champ unique (Rétrocompatibilité)
      else if (album.virtualFilter === 'tag' && album.filterValue) {
        const regex = new RegExp(album.filterValue, 'i'); // Note: ^ et $ enlevés pour être plus souple
        query.tags = regex;
        photos = await Photo.find(query).sort({ createdAt: -1 });
      }
      // 3. Logique par Date
      else if (album.virtualFilter === 'date') {
        if (album.startDate) query.createdAt = { ...query.createdAt, $gte: new Date(album.startDate) };
        if (album.endDate) query.createdAt = { ...query.createdAt, $lte: new Date(album.endDate) };
        photos = await Photo.find(query).sort({ createdAt: -1 });
      }

    } else {
      // --- ALBUM CLASSIQUE - LOGIQUE DE TRI V7 ---
      let sortCriteria: any = { createdAt: -1 }; // Défaut : Date Desc

      if (album.sortOrder === 'date_asc') {
        sortCriteria = { createdAt: 1 };
      } else if (album.sortOrder === 'manual') {
        sortCriteria = { index: 1 };
      }
      // Sinon on garde le défaut (date desc)

      photos = await Photo.find({ albumId: albumId }).sort(sortCriteria);
    }

    res.json(photos);
  } catch (error) {
    console.error("Erreur getAlbumPhotos", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// --- UPDATE ALBUM ---
export const updateAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.coverImage = req.file.filename;
    }

    const album = await Album.findByIdAndUpdate(id, updates, { new: true });
    if (!album) return res.status(404).json({ error: 'Album introuvable' });

    res.json(album);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
};

// --- DELETE ALBUM ---
export const deleteAlbum = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const photos = await Photo.find({ albumId: id });
    await Photo.deleteMany({ albumId: id });
    await Album.findByIdAndDelete(id);

    res.json({ message: 'Album supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
};

export { upload };
