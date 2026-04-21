// 24 Février 2016
// version v2.4 (Glassmorphism Update)

import React, { useState, useEffect } from 'react';

interface EditAlbumModalProps {
  album: any;
  onClose: () => void;
  onSave: (id: string, data: any) => void;
}

const EditAlbumModal: React.FC<EditAlbumModalProps> = ({ album, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Initialiser les champs quand la modale s'ouvre
  useEffect(() => {
    if (album) {
      setTitle(album.title || '');
      setDescription(album.description || '');
    }
  }, [album]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(album._id, { title, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      {/* Carte Verre (Glassmorphism) */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">

        {/* Bouton Fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white font-bold text-xl transition"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-6 text-white drop-shadow-lg">Modifier l'Album</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Titre</label>
            <input
              type="text"
              className="w-full bg-white/20 border border-white/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30 transition duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              className="w-full bg-white/20 border border-white/30 text-white placeholder-gray-400 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30 transition duration-200 h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-full transition font-medium border border-white/10"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-full font-bold shadow-lg transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAlbumModal;
