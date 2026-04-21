import crypto from 'crypto'; // <--- AJOUTE CETTE LIGNE
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService'; // Ajouter cet import
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_in_prod';



// --- MODIFIER : POST /register ---
/*  router.post('/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email déjà utilisé' });

      const hashedPassword = await bcrypt.hash(password, 10);

      // --- NOUVEAU : Vérifier si c'est le premier utilisateur ---
     const userCount = await User.countDocuments();
     const isFirstUser = userCount === 0;
     // --------------------------------------------------------


      // Création du token de vérification
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      const user = new User({
        name,
        email,
        password: hashedPassword,
        quotaLimit: 1 * 1024 * 1024 * 1024,
        isAdmin: isFirstUser,
        // Nouveaux champs
        isVerified: false,
        verificationToken,
        verificationTokenExpires
      });

      await user.save();

      // Envoi de l'email
      await sendVerificationEmail(user.email, verificationToken);

      res.status(201).json({ message: 'Inscription réussie ! Vérifiez vos emails pour activer votre compte.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }); */


  // --- MODIFIER : POST /register ---
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // --- NOUVEAU : Premier utilisateur = Admin ---
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    // ---------------------------------------------

    // Création du token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      quotaLimit: 1 * 1024 * 1024 * 1024,
      isAdmin: isFirstUser, // On utilise la variable ici
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    await user.save();

    // Envoi de l'email
    await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({ message: 'Inscription réussie ! Vérifiez vos emails.' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });

      // --- NOUVEAU : GET /verify-email ---
    router.get('/verify-email', async (req: Request, res: Response) => {
      const { token } = req.query;

      if (!token) return res.status(400).json({ error: 'Token manquant' });

      try {
        const user = await User.findOne({
          verificationToken: token,
          verificationTokenExpires: { $gt: new Date() } // Token non expiré
        });

        if (!user) {
          return res.status(400).json({ error: 'Lien invalide ou expiré.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.json({ message: 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.' });
      } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
      }
    });

/* router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email ou mot de passe incorrect');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Email ou mot de passe incorrect');

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
}); */
// --- MODIFIER : POST /login ---
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Identifiants incorrects' });

    /// Vérification du compte (amélioré pour les anciens users)
      if (user.isVerified === false) { // Double égal pour attraper false et undefined
        return res.status(403).json({ error: 'Veuillez vérifier vos emails pour activer votre compte.' });
      }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Identifiants incorrects' });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (error) {
    console.error('ERREUR LOGIN:', error); // <--- AJOUTE CETTE LIGNE
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
