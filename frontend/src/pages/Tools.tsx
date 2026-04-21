import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Tools = () => {
  const [albums, setAlbums] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [targetAlbum, setTargetAlbum] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [albumsRes, photosRes] = await Promise.all([
        api.get('/albums/my/albums'),
        api.get('/photos/my/photos')
      ]);
      // On garde les albums classiques pour la sélection de destination
      setAlbums(albumsRes.data.filter((a: any) => !a.isVirtual));
      setPhotos(photosRes.data);
    } catch (error) { console.error(error); }
  };

  const handleMove = async () => {
    if (!selectedPhoto || !targetAlbum) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner une photo et un album.' });
      return;
    }
    try {
      await api.put(`/photos/move/${selectedPhoto}`, { targetAlbumId: targetAlbum });
      setMessage({ type: 'success', text: 'Photo déplacée avec succès !' });
      setSelectedPhoto('');
      fetchData();
    } catch (error) { setMessage({ type: 'error', text: 'Erreur lors du déplacement.' }); }
  };

  // Trouver les détails de la photo sélectionnée pour l'aperçu
  const selectedPhotoData = photos.find(p => p._id === selectedPhoto);

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="relative z-10 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Outils & Maintenance</h1>
            <div className="flex gap-4 items-center">
                <Link to="/dashboard" className="text-sm bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full transition">
                    ← Retour Dashboard
                </Link>
            </div>
          </div>

          {/* Carte Outil */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Déplacer une photo</h2>

            {message && (
              <div className={`p-3 rounded mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Sélection Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">1. Sélectionner la photo</label>
                <select
                  value={selectedPhoto}
                  onChange={(e) => setSelectedPhoto(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 text-white p-3 rounded-lg"
                >
                  <option value="">-- Choisir une photo --</option>
                  {photos.map(p => {
                    // CORRECTION : On retrouve le nom de l'album parent
                    const parentAlbum = albums.find(a => a._id === p.albumId);
                    return (
                      <option key={p._id} value={p._id}>
                        {p.title} (Album: {parentAlbum?.title || 'Inconnu'})
                      </option>
                    );
                  })}
                </select>

                {/* Aperçu */}
                {selectedPhotoData && (
                  <div className="mt-4 flex items-center gap-4 bg-black/20 p-2 rounded-lg">
                    <img src={`/uploads/${selectedPhotoData.filename}`} className="w-16 h-16 object-cover rounded" alt="Aperçu" />
                    <div>
                        <p className="text-white font-medium">{selectedPhotoData.title}</p>
                        <p className="text-xs text-gray-400">{selectedPhotoData.tags?.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sélection Album Cible */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">2. Album de destination</label>
                <select
                  value={targetAlbum}
                  onChange={(e) => setTargetAlbum(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 text-white p-3 rounded-lg"
                >
                  <option value="">-- Choisir un album --</option>
                  {albums.map(a => (
                    <option key={a._id} value={a._id}>{a.title}</option>
                  ))}
                </select>

                <button
                  onClick={handleMove}
                  disabled={!selectedPhoto || !targetAlbum}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-full font-bold transition"
                >
                  Déplacer la photo
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Tools;
