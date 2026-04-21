import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import mongoose from 'mongoose';
import Photo from '../models/Photo';
import Album from '../models/Album';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// --- CONFIGURATION MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées !'), false);
  }
};

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;
const uploadMulter = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: maxFileSize }
});

// --- ROUTES ---

// 1. UPLOAD PHOTOS
router.post('/', authenticateToken, uploadMulter.array('photos'), async (req: Request, res: Response) => {
  try {
    const { albumId, metadata } = req.body;
    if (!req.files || !Array.isArray(req.files)) throw new Error('Aucun fichier');

    const files = req.files as Express.Multer.File[];
    const meta = metadata ? JSON.parse(metadata) : [];

    const album = await Album.findById(albumId);
    if (!album) return res.status(404).json({ error: 'Album introuvable' });
    if (album.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Action non autorisée' });
    if (album.isVirtual) return res.status(400).json({ error: 'Impossible d\'ajouter des photos à un album virtuel.' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);

    if (user.quotaUsed + totalUploadSize > user.quotaLimit) {
      files.forEach(f => { try { fs.unlinkSync(path.join(__dirname, '../../uploads', f.filename)); } catch (e) {} });
      return res.status(403).json({ error: `Espace insuffisant.` });
    }

    let coverFilename: string | null = null;

    const savedPhotos = await Promise.all(files.map(async (file) => {
      const data = meta.find((m: any) => m.originalName === file.originalname) || {};

      const inputPath = path.join(__dirname, '../../uploads', file.filename);
      const outputPath = path.join(__dirname, '../../uploads', 'tmp-' + file.filename);

      // --- LOGIQUE SHARP ---

      // 1. Charger l'image
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      // 2. Calculer dimensions cibles
      let targetWidth = metadata.width || 1920;
      let targetHeight = metadata.height || 1080;
      if (targetWidth > 1920) {
        const ratio = 1920 / targetWidth;
        targetWidth = 1920;
        targetHeight = Math.round((metadata.height || 1080) * ratio);
      }

      // 3. Préparer le resize
      let sharpChain = image.resize(1920, null, { fit: 'inside', withoutEnlargement: true });

      // 4. Filigrane
      if (data.applyWatermark) {
        const textToPrint = data.watermarkText || "© Hélioscope";
        const svgWidth = 300;
        const svgHeight = 50;
        const padding = 20;

        const leftPos = Math.max(0, targetWidth - svgWidth - padding);
        const topPos = Math.max(0, targetHeight - svgHeight - padding);

        const svgText = `
          <svg width="${svgWidth}" height="${svgHeight}">
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" rx="5" ry="5"/>
            <style>.title { fill: #ffffff; font-size: 20px; font-weight: bold; font-family: 'DejaVu Sans', sans-serif; }</style>
            <text x="50%" y="50%" class="title" text-anchor="middle" dominant-baseline="middle">${textToPrint}</text>
          </svg>
        `;

        const svgBuffer = Buffer.from(svgText);
        sharpChain = sharpChain.composite([{
          input: svgBuffer,
          top: topPos,
          left: leftPos
        }]);
      }

      await sharpChain.jpeg({ quality: 85 }).toFile(outputPath);
      fs.renameSync(outputPath, inputPath);
      // ----------------------------

      if (data.isCover) coverFilename = file.filename;
    //  const tagsArray = data.tag ? data.tag.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];
      const tagsArray = data.tag
              ? data.tag.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t)
              : [];
      return {
        albumId,
        userId: req.user.userId,
        filename: file.filename,
        index: data.index || 0,
        title: data.title || file.originalname,
        description: data.description || '',
        tags: tagsArray,
        size: file.size
      };
    }));

    await Photo.insertMany(savedPhotos);
    if (coverFilename) await Album.findByIdAndUpdate(albumId, { coverImage: coverFilename });

    user.quotaUsed += totalUploadSize;
    await user.save();

    res.json({ message: 'Upload réussi', count: savedPhotos.length });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: error.message || 'Erreur upload' });
  }
});

// 2. LISTER MES PHOTOS
router.get('/my/photos', authenticateToken, async (req: Request, res: Response) => {
  try {
    const photos = await Photo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération photos' });
  }
});

// 3. GET ALL TAGS
router.get('/tags', authenticateToken, async (req: Request, res: Response) => {
  try {
    const tags = await Photo.distinct('tags');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Erreur récupération tags' });
  }
});

// 4. DEPLACER UNE PHOTO
router.put('/move/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { targetAlbumId } = req.body;
    const photoId = req.params.id;
    if (!targetAlbumId) return res.status(400).json({ error: 'Album cible manquant' });

    const photo = await Photo.findById(photoId);
    if (!photo) return res.status(404).json({ error: 'Photo introuvable' });
    if (photo.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Non autorisé' });

    const targetAlbum = await Album.findById(targetAlbumId);
    if (!targetAlbum || targetAlbum.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Album cible non autorisé' });
    }

    photo.albumId = new mongoose.Types.ObjectId(targetAlbumId);
    await photo.save();
    res.json({ message: 'Photo déplacée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du déplacement' });
  }
});

// 5. METTRE A JOUR PHOTO
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ error: 'Photo introuvable' });
    if (photo.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Interdit' });

    //const { index, title, description, tags } = req.body;
    //const updatedPhoto = await Photo.findByIdAndUpdate(req.params.id, { index, title, description, tags }, { new: true });
    const { index, title, description, tags } = req.body;

      // Correction : On force les tags en minuscules si ils existent
      const lowercasedTags = tags ? tags.map((t: string) => t.toLowerCase()) : undefined;

      const updatedPhoto = await Photo.findByIdAndUpdate(
        req.params.id,
        { index, title, description, tags: lowercasedTags },
        { new: true }
      );
    res.json(updatedPhoto);
  } catch (error) { res.status(500).json({ error: 'Erreur modification photo' }); }
});

// 6. SUPPRIMER PHOTO
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      const photo = await Photo.findById(req.params.id);
      if (!photo) return res.status(404).json({ error: 'Photo introuvable' });
      if (photo.userId.toString() !== req.user.userId) return res.status(403).json({ error: 'Interdit' });

      const filePath = path.join(__dirname, '../../uploads', photo.filename);
      let fileSize = photo.size || 0;
      if (!fileSize && fs.existsSync(filePath)) fileSize = fs.statSync(filePath).size;

      try { fs.unlinkSync(filePath); } catch (err) { console.error(`Erreur suppression fichier`, err); }
      await Photo.findByIdAndDelete(req.params.id);

      await User.findByIdAndUpdate(req.user.userId, { $inc: { quotaUsed: -fileSize } });
      res.json({ message: 'Photo supprimée' });
    } catch (error) { res.status(500).json({ error: 'Erreur suppression' }); }
});

export default router;
