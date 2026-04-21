// backend/src/routes/reportRoutes.ts

import express, { Request, Response } from 'express';
import Report from '../models/Report';
import Album from '../models/Album'; // Import nécessaire
import Page from '../models/Page';   // Import nécessaire
import { authenticateToken } from '../middleware/auth';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configuration simple pour l'alerte admin
const adminTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});




// --- POST : Créer un signalement (inchangé) ---
/*router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, targetId, reason } = req.body;
    if (!type || !targetId || !reason) return res.status(400).json({ error: 'Informations manquantes' });

    // Vérification existence
    let exists = false;
    if (type === 'album') exists = !!(await Album.findById(targetId));
    if (type === 'page') exists = !!(await Page.findById(targetId));
    if (!exists) return res.status(404).json({ error: 'Cible introuvable' });

    const newReport = new Report({ type, targetId, reason });
    await newReport.save();
    res.status(201).json({ message: 'Signalement envoyé. Merci.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});*/

router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, targetId, reason } = req.body;
    if (!type || !targetId || !reason) return res.status(400).json({ error: 'Informations manquantes' });

    let exists = false;
    if (type === 'album') exists = !!(await Album.findById(targetId));
    if (type === 'page') exists = !!(await Page.findById(targetId));
    if (!exists) return res.status(404).json({ error: 'Cible introuvable' });

    const newReport = new Report({ type, targetId, reason });
    await newReport.save();

    // --- NOUVEAU : ENVOI MAIL ADMIN ---
    const adminEmail = process.env.ADMIN_EMAIL || 'helioscope@proton.me';
    try {
        await adminTransporter.sendMail({
            from: process.env.SMTP_FROM,
            to: adminEmail,
            subject: `⚠️ Nouveau signalement (${type})`,
            html: `
                <h3>Nouveau signalement</h3>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>ID:</strong> ${targetId}</p>
                <p><strong>Raison:</strong> ${reason}</p>
                <p><a href="https://helioscope.fr/admin/reports">Voir les signalements</a></p>
            `
        });
    } catch (mailErr) {
        console.error("Erreur envoi mail signalement:", mailErr);
        // On continue même si le mail échoue
    }
    // ----------------------------------

    res.status(201).json({ message: 'Signalement envoyé. Merci.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- GET : Voir les signalements (ENRICHIE) ---
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  if (!(req as any).user?.isAdmin) return res.status(403).json({ error: 'Accès refusé' });

  try {
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();

    // On va chercher les détails pour chaque signalement
    const enrichedReports = await Promise.all(reports.map(async (report) => {
      let targetDetails: any = null;

      if (report.type === 'page') {
        targetDetails = await Page.findById(report.targetId)
          .select('title userId slug')
          .populate('userId', 'name email'); // On récupère le nom du propriétaire
      } else if (report.type === 'album') {
        targetDetails = await Album.findById(report.targetId)
          .select('title userId coverImage')
          .populate('userId', 'name email');
      }

      return {
        ...report,
        targetDetails // On attache les détails ici
      };
    }));

    res.json(enrichedReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération' });
  }
});

// --- PATCH : Résoudre (inchangé) ---
router.patch('/:id/resolve', authenticateToken, async (req: Request, res: Response) => {
  if (!(req as any).user?.isAdmin) return res.status(403).json({ error: 'Accès refusé' });
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

export default router;
