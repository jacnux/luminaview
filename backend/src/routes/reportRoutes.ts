// backend/src/routes/reportRoutes.ts

import express, { Request, Response } from 'express';
import Report from '../models/Report';
import Album from '../models/Album';
//import Page from '../models/Page';
import UserPage from '../models/UserPage'; // NOUVEAU : Import du nouveau modèle
import { authenticateToken } from '../middleware/auth';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configuration email
const adminTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, targetId, reason } = req.body;
    if (!type || !targetId || !reason) return res.status(400).json({ error: 'Informations manquantes' });

    let exists = false;
    if (type === 'album') exists = !!(await Album.findById(targetId));
  //  if (type === 'page') exists = !!(await Page.findById(targetId));
    if (type === 'user_page') exists = !!(await UserPage.findById(targetId)); // NOUVEAU : Vérifie le nouveau modèle

    if (!exists) return res.status(404).json({ error: 'Cible introuvable' });

    const newReport = new Report({ type, targetId, reason });
    await newReport.save();

    // Envoi Mail Admin
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
    }

    res.status(201).json({ message: 'Signalement envoyé. Merci.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// --- GET : Voir les signalements (Enrichié pour UserPage) ---
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  if (!(req as any).user?.isAdmin) return res.status(403).json({ error: 'Accès refusé' });

  try {
    const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();

    const enrichedReports = await Promise.all(reports.map(async (report) => {
      let targetDetails: any = null;

      /*if (report.type === 'page') {
        targetDetails = await Page.findById(report.targetId)
          .select('title userId slug')
          .populate('userId', 'name email');
      } else */
      if (report.type === 'user_page') {
        // NOUVEAU : On récupère les infos de la nouvelle page
        targetDetails = await UserPage.findById(report.targetId)
          .select('title userId slug')
          .populate('userId', 'name email');
      } else if (report.type === 'album') {
        targetDetails = await Album.findById(report.targetId)
          .select('title userId coverImage')
          .populate('userId', 'name email');
      }

      return { ...report, targetDetails };
    }));

    res.json(enrichedReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur récupération' });
  }
});

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
