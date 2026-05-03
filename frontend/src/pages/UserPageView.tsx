import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Lightbox from '../components/Lightbox';
import ReactMarkdown from 'react-markdown'; // <--- 1. IMPORT AJOUTÉ

const UserPageView = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [lightboxData, setLightboxData] = useState<{ photos: any[], index: number } | null>(null);

  useEffect(() => {
    if (!slug || !username) {
      setLoading(false);
      setError("Paramètres d'URL manquants.");
      return;
    }

    const fetchPage = async () => {
      try {
        setLoading(true);
        const cleanSlug = slug.trim();
        const res = await api.get(`/user-pages/${username}/${cleanSlug}`);
        setPage(res.data);
      } catch (err: any) {
        console.error("[Frontend] Erreur API:", err);
        setError(err.response?.data?.error || 'Impossible de charger la page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [username, slug]);

  // Fonctions Lightbox
  const openLightbox = (photos: any[], index: number) => setLightboxData({ photos, index });
  const closeLightbox = () => setLightboxData(null);

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center text-xl animate-pulse">Chargement...</div>;
  if (error) return <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center text-red-400 p-8"><p className="mb-4">{error}</p><Link to={`/portfolio/${username}`} className="text-yellow-400 underline">Retour</Link></div>;
  if (!page) return null;

  const sections = page.sections || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="py-12 border-b border-gray-800 text-center">
        <h1 className="text-4xl font-bold text-yellow-400">{page.title || 'Page'}</h1>
        <Link to={`/portfolio/${username}`} className="text-sm text-gray-500 hover:text-white mt-2 inline-block">
          ← Retour au portfolio de {username}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-4">
        {sections.length === 0 ? (
          <p className="text-center text-gray-500 italic">Cette page est vide.</p>
        ) : (
          sections.map((section: any, index: number) => {
            if (!section) return null;

            // --- 1. BLOC TEXTE SIMPLE (MARKDOWN ACTIVÉ) ---
            if (section.type === 'text') {
              return (
                <div key={index} className="mb-12 max-w-none">
                  <div className="prose prose-invert prose-lg bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                    {/* On utilise ReactMarkdown ici */}
                    <ReactMarkdown>{section.content || ''}</ReactMarkdown>
                  </div>
                </div>
              );
            }

            // --- 2. BLOC GALERIE SIMPLE ---
            if (section.type === 'gallery') {
               if (!section.albumIds || section.albumIds.length === 0) return null;
               return (
                <div key={index} className="mb-12">
                   {section.albumIds.map((album: any) => {
                     if (!album) return null;
                     return (
                        <div key={album._id || Math.random()} className="my-6">
                           {album.title && <h3 className="text-xl font-bold mb-4 text-gray-300">{album.title}</h3>}
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                             {album.photos && album.photos.map((photo: any, i: number) => (
                               <img
                                 key={photo._id || i}
                                 src={`/uploads/${photo.filename}`}
                                 className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-80"
                                 alt=""
                                 onClick={() => openLightbox(album.photos, i)}
                               />
                             ))}
                           </div>
                        </div>
                     );
                   })}
                </div>
               );
            }

            // --- 3. BLOC MIXTE (MARKDOWN ACTIVÉ) ---
            if (section.type === 'split_text_gallery') {
              return (
                <div key={index} className="mb-12 flex flex-col md:flex-row gap-8 items-start border-b border-gray-800 pb-12">

                  {/* Colonne Texte (Markdown activé) */}
                  <div className="w-full md:w-[30%] bg-gray-800/50 p-6 rounded self-stretch overflow-hidden">
                     <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{section.content || ''}</ReactMarkdown>
                     </div>
                  </div>

                  {/* Colonne Galerie */}
                  <div className="w-full md:w-[70%]">
                     {section.albumIds && section.albumIds.length > 0 ? (
                        section.albumIds.map((album: any) => {
                           if(!album) return null;
                           return (
                              <div key={album._id || Math.random()} className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                 {album.photos && album.photos.map((photo: any, i: number) => (
                                    <img
                                      key={photo._id || i}
                                      src={`/uploads/${photo.filename}`}
                                      className="w-full aspect-square object-cover rounded cursor-pointer hover:opacity-80"
                                      alt=""
                                      onClick={() => openLightbox(album.photos, i)}
                                    />
                                 ))}
                              </div>
                           );
                        })
                     ) : (
                       <p className="text-gray-500 text-center border border-dashed p-4 rounded">Aucun album.</p>
                     )}
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>

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
