/*import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_in_prod';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Accès refusé. Droits Administrateur requis.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Erreur vérification admin' });
  }
};
*/
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Récupérer le token (Header Authorization: Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Accès refusé. Token manquant.' });

  // 2. Vérifier le token
  // IMPORTANT : Utiliser la meme clé secrète que dans authRoutes
  const secret = process.env.JWT_SECRET || 'default_secret';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
        console.error("Erreur vérification token:", err.message);
        return res.status(403).json({ error: 'Token invalide ou expiré.' });
    }

    req.user = user;
    next();
  });
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès admin requis.' });
  }
  next();
};
