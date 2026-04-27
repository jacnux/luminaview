// Version 1.3 (Toggle Description)

import React, { useState, useEffect } from 'react';

interface LightboxProps {
  photos: any[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photos, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showDesc, setShowDesc] = useState(false); // État pour afficher/masquer la description

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setShowDesc(false); // On cache la description quand on change d'image
  }, [currentIndex]);

  const currentPhoto = photos[currentIndex];

  if (!currentPhoto) return null;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.5), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col" onWheel={handleWheel}>

      {/* 1. ZONE HAUTE : Titre + Contrôles */}
      <div className="absolute top-0 left-0 w-full p-4 z-20 flex justify-between items-start pointer-events-none">

      <div className="text-white bg-black/50 backdrop-blur-sm p-2 rounded pointer-events-auto max-w-[70%]">
        <h3 className="font-bold text-lg md:text-xl drop-shadow-lg truncate">
          {currentPhoto.title}
        </h3>
      </div>

        <div className="flex gap-2 items-center">
          <span className="text-white font-mono bg-black/50 px-2 py-1 rounded text-sm">
            {currentIndex + 1} / {photos.length}
          </span>
          <button
            onClick={onClose}
            className="text-white text-3xl hover:text-red-500 pointer-events-auto leading-none"
          >
            ×
          </button>
        </div>
      </div>

      {/* 2. ZONE CENTRALE : L'image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={`/uploads/${currentPhoto.filename}`}
          alt="Full"
          className="max-w-full max-h-full object-contain transition-transform duration-75 select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            cursor: zoom > 1 ? 'grab' : 'default'
          }}
          draggable={false}
        />
      </div>

      {/* 3. BOUTON TOGGLE DESCRIPTION (En bas à droite) */}
      {currentPhoto.description && (
        <button
            onClick={() => setShowDesc(!showDesc)}
            className={`absolute bottom-4 right-4 z-30 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${showDesc ? 'bg-blue-500 hover:bg-blue-600' : 'bg-black/50 hover:bg-black/80'}`}
            title={showDesc ? "Masquer le commentaire" : "Voir le commentaire"}
        >
          {/* Icône Info ou Fermer */}
          {showDesc ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          )}
        </button>
      )}

      {/* 4. ZONE BASSE : Description (Conditionnelle au Toggle) */}
      {showDesc && currentPhoto.description && (
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-auto bg-black/80 backdrop-blur-sm">
          <div className="p-4 max-h-32 overflow-y-auto text-white text-sm">
            <p>{currentPhoto.description}</p>
          </div>
        </div>
      )}

      {/* 5. Navigation Flèches */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-10 pointer-events-none">
        <button
          onClick={() => setCurrentIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
          disabled={photos.length <= 1}
          className="text-white text-4xl hover:text-blue-400 disabled:opacity-30 pointer-events-auto"
        >
          ←
        </button>
        <button
          onClick={() => setCurrentIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
          disabled={photos.length <= 1}
          className="text-white text-4xl hover:text-blue-400 disabled:opacity-30 pointer-events-auto"
        >
          →
        </button>
      </div>

    </div>
  );
};

export default Lightbox;
