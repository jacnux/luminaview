import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';

// Mock des modèles MongoDB
jest.mock('../models/Photo');
jest.mock('../models/Album');

import Photo from '../models/Photo';
import Album from '../models/Album';
import { getAlbumPhotos, deletePhoto, updatePhoto, movePhoto, getAllTags } from '../controllers/photoController';

// Création d'une application Express pour les tests
const app = express();
app.use(express.json());

// Routes de test
app.get('/api/photos/tags', getAllTags);
app.get('/api/photos/album/:id', getAlbumPhotos);
app.delete('/api/photos/:id', deletePhoto);
app.put('/api/photos/:id', updatePhoto);
app.post('/api/photos/:id/move', movePhoto);

describe('Photo Controller Tests', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('devrait retourner tous les tags uniques', async () => {
      const mockTags = ['nature', 'voyage', 'famille'];
      (Photo.distinct as jest.Mock).mockResolvedValue(mockTags);

      const response = await request(app).get('/api/photos/tags');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTags);
      expect(Photo.distinct).toHaveBeenCalledWith('tags');
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Photo.distinct as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get('/api/photos/tags');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur récupération tags' });
    });
  });

  describe('getAlbumPhotos', () => {
    const mockAlbumId = new mongoose.Types.ObjectId().toString();
    const mockUserId = new mongoose.Types.ObjectId().toString();

    it('devrait retourner 404 si l\'album n\'existe pas', async () => {
      (Album.findById as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get(`/api/photos/album/${mockAlbumId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Album introuvable' });
    });

    it('devrait retourner les photos pour un album virtuel avec tags', async () => {
      const mockAlbum = {
        _id: mockAlbumId,
        isVirtual: true,
        tags: ['nature', 'soleil'],
        userId: mockUserId
      };
      const mockPhotos = [
        { _id: 'photo1', filename: 'photo1.jpg', tags: ['nature'] },
        { _id: 'photo2', filename: 'photo2.jpg', tags: ['soleil'] }
      ];

      (Album.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (Photo.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos)
      });

      const response = await request(app).get(`/api/photos/album/${mockAlbumId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Photo.find).toHaveBeenCalledWith({
        tags: { $in: mockAlbum.tags },
        userId: mockUserId
      });
    });

    it('devrait retourner les photos pour un album classique', async () => {
      const mockAlbum = {
        _id: mockAlbumId,
        isVirtual: false,
        userId: mockUserId
      };
      const mockPhotos = [
        { _id: 'photo1', filename: 'photo1.jpg', albumId: mockAlbumId },
        { _id: 'photo2', filename: 'photo2.jpg', albumId: mockAlbumId }
      ];

      (Album.findById as jest.Mock).mockResolvedValue(mockAlbum);
      (Photo.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPhotos)
      });

      const response = await request(app).get(`/api/photos/album/${mockAlbumId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(Photo.find).toHaveBeenCalledWith({ albumId: mockAlbumId });
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Album.findById as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).get(`/api/photos/album/${mockAlbumId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur récupération photos' });
    });
  });

  describe('deletePhoto', () => {
    const mockPhotoId = new mongoose.Types.ObjectId().toString();

    it('devrait supprimer une photo avec succès', async () => {
      (Photo.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      const response = await request(app).delete(`/api/photos/${mockPhotoId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Supprimé' });
      expect(Photo.findByIdAndDelete).toHaveBeenCalledWith(mockPhotoId);
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Photo.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app).delete(`/api/photos/${mockPhotoId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur suppression' });
    });
  });

  describe('updatePhoto', () => {
    const mockPhotoId = new mongoose.Types.ObjectId().toString();
    const mockUpdateData = { title: 'Nouveau titre', description: 'Nouvelle description' };
    const mockUpdatedPhoto = {
      _id: mockPhotoId,
      ...mockUpdateData,
      filename: 'photo.jpg'
    };

    it('devrait mettre à jour une photo avec succès', async () => {
      (Photo.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPhoto);

      const response = await request(app)
        .put(`/api/photos/${mockPhotoId}`)
        .send(mockUpdateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(mockUpdatedPhoto));
      expect(Photo.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPhotoId,
        mockUpdateData,
        { new: true }
      );
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Photo.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app)
        .put(`/api/photos/${mockPhotoId}`)
        .send(mockUpdateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur mise à jour' });
    });
  });

  describe('movePhoto', () => {
    const mockPhotoId = new mongoose.Types.ObjectId().toString();
    const mockTargetAlbumId = new mongoose.Types.ObjectId().toString();
    const mockMovedPhoto = {
      _id: mockPhotoId,
      albumId: mockTargetAlbumId,
      filename: 'photo.jpg'
    };

    it('devrait déplacer une photo vers un autre album avec succès', async () => {
      (Photo.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockMovedPhoto);

      const response = await request(app)
        .post(`/api/photos/${mockPhotoId}/move`)
        .send({ targetAlbumId: mockTargetAlbumId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.objectContaining(mockMovedPhoto));
      expect(Photo.findByIdAndUpdate).toHaveBeenCalledWith(
        mockPhotoId,
        { albumId: mockTargetAlbumId },
        { new: true }
      );
    });

    it('devrait retourner une erreur 500 en cas d\'échec', async () => {
      (Photo.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Erreur DB'));

      const response = await request(app)
        .post(`/api/photos/${mockPhotoId}/move`)
        .send({ targetAlbumId: mockTargetAlbumId });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Erreur déplacement' });
    });
  });
});
