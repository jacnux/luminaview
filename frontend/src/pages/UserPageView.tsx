import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Lightbox from '../components/Lightbox';
import MarkdownRenderer from '../components/MarkdownRenderer'; // <--- 1. IMPORT AJOUTÉ

const UserPageView = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Pour signalement
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  //   fin
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

  // pour lesignalement

  const handleSendReport = async () => {
        if (!reportReason.trim()) {
            alert("Merci d'indiquer la raison.");
            return;
        }
        try {
            await api.post('/reports', {
                type: 'Signalement', // Pour le nouveau système
                targetId: page._id,
                reason: reportReason
            });
            alert("Signalement envoyé.");
            setShowReportModal(false);
            setReportReason('');
        } catch (err) {
            alert("Erreur");
        }
    };

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
          {/*   if (section.type === 'text') {
              return (
                <div key={index} className="mb-12 max-w-none">
                  <div className="prose prose-invert prose-lg text-white-500 bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                
                    <MarkdownRenderer className="prose">{section.content || ''}</MarkdownRenderer>
                  </div>
                </div>
              );
            }  */}

            if (section.type === 'text') {
                  return (
                    <div key={index} className="mb-12 max-w-none">
                      <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                        <MarkdownRenderer className="prose prose-invert prose-lg max-w-none
                          prose-headings:text-white
                          prose-p:text-white
                          prose-li:text-white
                          prose-strong:text-white
                          prose-a:text-yellow-400 hover:prose-a:text-yellow-300">
                          {section.content || ''}
                        </MarkdownRenderer>
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
                        <MarkdownRenderer className="prose">{section.content || ''}</MarkdownRenderer>
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
      {/* Bouton Signalement Flottant */}
      <button
        onClick={() => setShowReportModal(true)}
        className="fixed bottom-20 right-6 z-50 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-3 rounded-full shadow-lg text-xs border border-red-400/30 transition"
        title="Signaler"
      >
        🚩
      </button>

      {/* Modale de Signalement */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">Signaler un contenu</h3>
            <p className="text-sm text-gray-400 mb-4">
                Page : <span className="text-white font-bold">{page?.title}</span>
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Raison du signalement (obligatoire)..."
              className="w-full bg-black/30 p-3 rounded border border-white/10 text-white h-24 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm text-gray-400">Annuler</button>
              <button onClick={handleSendReport} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPageView;
