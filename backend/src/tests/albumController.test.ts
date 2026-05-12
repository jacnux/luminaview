import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

// Mock des modèles MongoDB et des dépendances externes
jest.mock('../models/Album');
jest.mock('../models/Photo');

// Mock multer - doit être fait avant l'import du controller
jest.mock('multer', () => {
  const multerMock = jest.fn();
  (multerMock as any).diskStorage = jest.fn((options) => options);
  return multerMock;
});

import Album from '../models/Album';
import Photo from '../models/Photo';
import { createAlbum, getAlbumPhotos, updateAlbum, deleteAlbum } from '../controllers/AlbumController';

// Création d'une application Express pour les tests
const app = express();
app.use(express.json());

// Routes de test
app.post('/api/albums', createAlbum);
app.get('/api/albums/:albumId/photos', getAlbumPhotos);
app.put('/api/albums/:id', updateAlbum);
app.delete('/api/albums/:id', deleteAlbum);

describe('Album Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlbumPhotos', () => {
    const mockAlbumId = new mongoose.Types.ObjectId().toString();

    it('devrait retourner 400 si l\'ID est invalide', async () => {
      const response = await request(app).get('/api/albums/invalid-id/photos');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });

    it('devrait retourner 404 si l\'album n\'existe pas', async () => {
      (Album.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(`/api/albums/${mockAlbumId}/photos`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Album introuvable' });
    });

    it('devrait retourner les photos pour un album virtuel avec filter tag', async () => {
      const mockAlbum = {
        _id: mockAlbumId,
        isVirtual: true,
        virtualFilter: 'tag',
        filterValue: 'nature',
        tags: []
      };
      const mockPhotos = [
        { _id: new mongoose.Types.ObjectId(), filename: 'photo1.jpg', tags: ['nature'] }
      ];

      (Album.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (Photo.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos)
      });

      const response = await request(app).get(`/api/albums/${mockAlbumId}/photos`);

      expect(response.status).toBe(200);
      expect(Photo.find).toHaveBeenCalled();
    });

    it('devrait retourner les photos pour un album classique trié par date descendante', async () => {
      const mockAlbum = {
        _id: mockAlbumId,
        isVirtual: false,
        sortOrder: 'date_desc'
      };
      const mockPhotos = [
        { _id: new mongoose.Types.ObjectId(), filename: 'photo1.jpg', albumId: mockAlbumId }
      ];

      (Album.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (Photo.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos)
      });

      const response = await request(app).get(`/api/albums/${mockAlbumId}/photos`);

      expect(response.status).toBe(200);
      expect(Photo.find).toHaveBeenCalledWith({ albumId: mockAlbumId });
    });

    it('devrait retourner les photos pour un album classique trié manuellement', async () => {
      const mockAlbum = {
        _id: mockAlbumId,
        isVirtual: false,
        sortOrder: 'manual'
      };
      const mockPhotos = [
        { _id: new mongoose.Types.ObjectId(), filename: 'photo1.jpg', albumId: mockAlbumId, index: 0 }
      ];

      (Album.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (Photo.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos)
      });

      const response = await request(app).get(`/api/albums/${mockAlbumId}/photos`);

      expect(response.status).toBe(200);
      expect(Photo.find).toHaveBeenCalledWith({ albumId: mockAlbumId });
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Album.findById as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get(`/api/albums/${mockAlbumId}/photos`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur serveur' });
    });
  });

  describe('updateAlbum', () => {
    const mockAlbumId = new mongoose.Types.ObjectId().toString();
    const mockUpdateData = { title: 'Nouveau titre', description: 'Nouvelle description' };
    const mockUpdatedAlbum = {
      _id: mockAlbumId,
      ...mockUpdateData
    };

    it('devrait mettre à jour un album avec succès', async () => {
      (Album.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedAlbum);

      const response = await request(app)
        .put(`/api/albums/${mockAlbumId}`)
        .send(mockUpdateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(mockUpdatedAlbum));
      expect(Album.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAlbumId,
        expect.objectContaining(mockUpdateData),
        { new: true }
      );
    });

    it('devrait retourner 404 si l\'album n\'existe pas', async () => {
      (Album.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/albums/${mockAlbumId}`)
        .send(mockUpdateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Album introuvable' });
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Album.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app)
        .put(`/api/albums/${mockAlbumId}`)
        .send(mockUpdateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur mise à jour' });
    });
  });

  describe('deleteAlbum', () => {
    const mockAlbumId = new mongoose.Types.ObjectId().toString();

    it('devrait supprimer un album et ses photos avec succès', async () => {
      const mockPhotos = [{ _id: new mongoose.Types.ObjectId(), filename: 'photo1.jpg' }];
      
      (Photo.find as jest.Mock).mockResolvedValue(mockPhotos);
      (Photo.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (Album.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete(`/api/albums/${mockAlbumId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Album supprimé' });
      expect(Photo.deleteMany).toHaveBeenCalledWith({ albumId: mockAlbumId });
      expect(Album.findByIdAndDelete).toHaveBeenCalledWith(mockAlbumId);
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Photo.find as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).delete(`/api/albums/${mockAlbumId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur suppression' });
    });
  });
});
