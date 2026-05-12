// ============================================================
// LUMINAVIEW API — server.ts
// v4.1 — Mai 2026
// ============================================================

import express    from 'express';
import mongoose   from 'mongoose';
import cors       from 'cors';
import helmet     from 'helmet';
import rateLimit  from 'express-rate-limit';
import hpp        from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes      from './routes/authRoutes';
import albumRoutes     from './routes/albumRoutes';
import photoRoutes     from './routes/photoRoutes';
import adminRoutes     from './routes/adminRoutes';
import userRoutes      from './routes/userRoutes';
import reportRoutes    from './routes/reportRoutes';
import userPagesRoutes from './routes/userPagesRoutes';



// ============================================================
// INITIALISATION
// ============================================================

const app  = express();
const PORT = 3000;

// Confiance au reverse proxy Nginx (nécessaire pour rate limiting par IP)
app.set('trust proxy', 1);


// ============================================================
// SÉCURITÉ
// ============================================================

// Headers HTTP sécurisés (XSS, Cache-Control, etc.)
app.use(helmet());

// Anti-DDOS : 100 requêtes max par IP par 15 minutes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
}));

// Protection contre la pollution des paramètres HTTP
app.use(hpp());

// Nettoyage des inputs contre les injections NoSQL
app.use(mongoSanitize());


// ============================================================
// MIDDLEWARE GÉNÉRAL
// ============================================================

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Fichiers uploadés (volume Docker)
app.use('/uploads', express.static('/app/uploads'));


// ============================================================
// BASE DE DONNÉES
// ============================================================

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://mongo:27017/luminaview')
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ MongoDB erreur:', err));


// ============================================================
// ROUTES
// ============================================================

app.use('/api/auth',       authRoutes);
app.use('/api/albums',     albumRoutes);
app.use('/api/photos',     photoRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/user-pages', userPagesRoutes);





// ============================================================
// DÉMARRAGE
// ============================================================

app.listen(PORT, '0.0.0.0', () =>
  console.log(`🚀 LuminaView API running on port ${PORT}`)
);
