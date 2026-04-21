// 24 Février 2026
// Version 4.0 (Refactoring + Contrôleurs + Albums Virtuels + Liste des tags)

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
// Pour la sécurité
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize'; // N'oublie pas l'import


// Import des routes
import authRoutes from './routes/authRoutes';
import albumRoutes from './routes/albumRoutes';
import photoRoutes from './routes/photoRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import pageRoutes from './routes/pageRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();
const PORT = 3000;
// --- AJOUTER CETTE LIGNE ---
// On dit à Express de faire confiance au reverse proxy (Nginx)
app.set('trust proxy', 1);
// ----------------------------


// --- CONFIGURATION ---
// 1. HELMET : Headers de sécurité (Cache-Control, XSS Protection, etc.)
app.use(helmet());

// 2. RATE LIMITING : Limite à 100 requêtes par 15 minutes par IP (Anti-DDOS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// 3. HPP : Empêche la pollution des paramètres HTTP
app.use(hpp());

// 4. MONGO SANITIZE : Nettoie les inputs pour éviter les injections NoSQL
app.use(mongoSanitize());

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// NOUVEAU (Chemin absolu et direct correspondant au volume Docker)
app.use('/uploads', express.static('/app/uploads'));
// Pour le bouton siganlement
app.use('/api/reports', reportRoutes);

// --- MONGOOSE ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/luminaview')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error(err));

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/admin', adminRoutes);
// ajout v6.0
app.use('/api/users', userRoutes);
app.use('/api/pages', pageRoutes);

// --- START ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`LuminaView API running on port ${PORT}`);
});
