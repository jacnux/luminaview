import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
//import Lightbox from '../components/Lightbox'; // IMPORT DU COMPOSANT OFFICIEL

import Lightbox from '../components/Lightbox';

const UserPageView = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- STATE POUR LA LIGHTBOX OFFICIELLE ---
  // On lui passe un tableau d'objets photo complets
  const [lightboxData, setLightboxData] = useState<{ photos: any[], index: number } | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      try {
        const cleanSlug = slug.trim();
        const res = await api.get(`/user-pages/${username}/${cleanSlug}`);
        setPage(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || 'Page introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [username, slug]);

  // Fonction pour ouvrir la lightbox
  const openLightbox = (photos: any[], index: number) => {
      setLightboxData({ photos, index });
  };

  // Fonction pour fermer la lightbox
  const closeLightbox = () => {
      setLightboxData(null);
  };

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Chargement...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-red-400">
      <p className="mb-4">{error}</p>
      <Link to={`/portfolio/${username}`} className="text-yellow-400 underline">Retour au portfolio</Link>
  </div>;

  const sections = page?.sections || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="py-12 border-b border-gray-800 text-center">
        <h1 className="text-4xl font-bold text-yellow-400">{page?.title || 'Page'}</h1>
        <Link to={`/portfolio/${username}`} className="text-sm text-gray-500 hover:text-white mt-2 inline-block">
          ← Retour au portfolio de {username}
        </Link>
      </div>

      <div className="max-w-4xl mx-auto py-10 px-4">
        {sections.length === 0 ? (
           <p className="text-center text-gray-500">Cette page est vide.</p>
        ) : (
            sections.map((section: any, index: number) => {
                if (!section) return null;
                return (
                  <div key={index} className="mb-16">

                    {/* --- SECTION TEXTE --- */}
                    {section.type === 'text' && (
                      <div className="prose prose-invert prose-lg max-w-none mx-auto bg-gray-800/30 p-6 rounded-xl border border-gray-800 whitespace-pre-wrap">
                          {section.content || 'Contenu vide'}
                      </div>
                    )}

                    {/* --- SECTION GALERIE --- */}
                    {section.type === 'gallery' && (
                        Array.isArray(section.albumIds) && section.albumIds.length > 0 && (
                           section.albumIds.map((album: any) => {
                               if (!album || !album.title) return null;

                               return (
                                  <div key={album._id} className="my-8">
                                    <h3 className="text-2xl font-bold mb-6 text-center text-gray-300">{album.title}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                      {album.photos && album.photos.map((photo: any, i: number) => (
                                        <img
                                          key={photo._id || i}
                                          src={`/uploads/${photo.filename}`}
                                          className="w-full aspect-square object-cover rounded-lg hover:opacity-80 transition duration-300 cursor-pointer"
                                          alt={photo.title || ''}
                                          onClick={() => openLightbox(album.photos, i)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                               );
                           })
                        )
                    )}

                  </div>
                );
            })
        )}
      </div>

      {/* --- UTILISATION DU COMPOSANT LIGHTBOX OFFICIEL --- */}
      {lightboxData && (
          <Lightbox
              photos={lightboxData.photos}
              initialIndex={lightboxData.index}
              onClose={closeLightbox}
          />
      )}

    </div>
  );
};

export default UserPageView;
