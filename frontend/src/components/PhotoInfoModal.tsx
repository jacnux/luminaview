import React from 'react';

const PhotoInfoModal = ({ photo, onClose }: { photo: any, onClose: () => void }) => {
  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/20 rounded-xl max-w-md w-full p-6 relative text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl">&times;</button>

        <h3 className="text-xl font-bold mb-4">Infos Photo</h3>
        <img src={`/uploads/${photo.filename}`} alt="" className="w-full h-48 object-cover rounded-lg mb-4 bg-black"/>

        <div className="space-y-2 text-sm">
          <p><strong>Titre:</strong> {photo.title || 'N/A'}</p>
          <p><strong>Description:</strong> {photo.description || 'N/A'}</p>
          <p><strong>Tags:</strong> {photo.tags?.join(', ') || 'Aucun'}</p>
          <p><strong>Date:</strong> {new Date(photo.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoInfoModal;
