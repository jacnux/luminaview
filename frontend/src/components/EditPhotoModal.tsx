import React, { useState, useEffect } from 'react';

interface EditPhotoModalProps {
  photo: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditPhotoModal: React.FC<EditPhotoModalProps> = ({ photo, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [index, setIndex] = useState<number>(0); // NOUVEAU : État pour l'index

  useEffect(() => {
    if (photo) {
      setTitle(photo.title || '');
      setDescription(photo.description || '');
      setTags(Array.isArray(photo.tags) ? photo.tags.join(', ') : '');
      setIndex(photo.index || 0); // NOUVEAU : Initialiser l'index
    }
  }, [photo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);

    onSave({
      title,
      description,
      tags: tagsArray,
      index: Number(index) // NOUVEAU : Envoyer l'index
    });
  };

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl">&times;</button>

        <h2 className="text-xl font-bold text-white mb-6">Modifier la photo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NOUVEAU : Champ Index */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Index (Ordre manuel)</label>
            <input
              type="number"
              value={index}
              onChange={(e) => setIndex(parseInt(e.target.value) || 0)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
              min="0"
            />
            <p className="text-xs text-gray-500 mt-1">Utilisé uniquement si le tri de l'album est "Manuel".</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tags (séparés par des virgules)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ex: nature, paysage, voyages"
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg font-bold transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold transition"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPhotoModal;
