import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';

interface PublicPageProps {
  slug?: string;
}

const PublicPage: React.FC<PublicPageProps> = ({ slug: propSlug }) => {
  // --- Hooks et Variables ---
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const finalSlug = propSlug || urlSlug;

  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // State pour le signalement
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // --- Effets ---
  useEffect(() => {
    if (finalSlug) {
      api.get(`/pages/public/${finalSlug}`)
        .then(res => setPage(res.data))
        .catch(err => setError(err.response?.data?.error || "Erreur de chargement."));
    }
  }, [finalSlug]);

  // --- Fonctions ---
  const handleSendReport = async () => {
    if (!reportReason.trim()) {
      alert("Merci d'indiquer la raison.");
      return;
    }
    try {
      await api.post('/reports', {
        type: 'page',
        targetId: page._id,
        reason: reportReason
      });
      alert("Signalement envoyé. Merci.");
      setShowReportModal(false);
      setReportReason('');
    } catch (err) {
      alert("Erreur lors de l'envoi.");
    }
  };

  // --- Rendu ---
  if (error) return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Oups !</h1>
      <p className="text-gray-400">{error}</p>
      <a href="https://helioscope.fr" className="mt-4 text-blue-400 underline">Retour à l'accueil</a>
    </div>
  );

  if (!page) return <div className="h-screen bg-black text-white flex items-center justify-center">Chargement...</div>;

  const bgClass = page.background || 'bg-black';
  const social = page.socialLinks || {};

  return (
    <div className={`min-h-screen text-white ${bgClass}`}>

      {/* --- SECTION HEADER (Conditionnel) --- */}
      {page.heroImage ? (
        <div className="relative w-full h-64 md:h-80 overflow-hidden">
          <img src={`/uploads/${page.heroImage}`} className="w-full h-full object-cover" alt="Bannière" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col items-center">
            {page.userId?.avatar && (
              <img src={`/uploads/${page.userId.avatar}`} className="w-24 h-24 rounded-full border-4 border-white shadow-xl mb-4 object-cover" alt="Avatar" />
            )}
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">{page.title}</h1>
            <p className="text-gray-200 mt-2 text-lg">Par {page.userId?.name}</p>
          </div>
        </div>
      ) : (
        <div className="relative h-64 flex flex-col items-center justify-center">
          {page.userId?.avatar && (
            <img src={`/uploads/${page.userId.avatar}`} className="w-20 h-20 rounded-full border-4 border-white shadow-xl mb-4 object-cover" alt="Avatar" />
          )}
          <h1 className="text-4xl font-bold">{page.title}</h1>
          <p className="text-gray-400 mt-2">Par {page.userId?.name}</p>
        </div>
      )}

      {/* --- SECTION BIO --- */}
          {page.bio && (
            <div className="max-w-2xl mx-auto px-4 py-8 text-center border-b border-white/10">
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown>{page.bio}</ReactMarkdown>
              </div>
            </div>
          )}

      {/* --- SECTION GALERIES --- */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.isArray(page.showcaseAlbums) && page.showcaseAlbums.length > 0 ? (
            page.showcaseAlbums.map((album: any) => (
              <a
                key={album._id}
                href={`/album/${album._id}?mode=viewer`}
                className="block bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition group"
              >
                <div className="aspect-square bg-black/20 overflow-hidden">
                  {album.coverImage ? (
                    <img src={`/uploads/${album.coverImage}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" alt="Cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate">{album.title}</h3>
                  <p className="text-xs text-gray-400 truncate mt-1">{album.description || "Voir la galerie"}</p>
                </div>
              </a>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500 py-10">Aucune galerie à afficher.</p>
          )}
        </div>
      </div>

      {/* --- SECTION CONTACT --- */}
      {(social.instagram || social.facebook || social.website || social.email || social.phone) && (
        <div className="max-w-2xl mx-auto px-4 py-8 text-center border-t border-white/10">
          <h3 className="text-xl font-bold mb-4">Contact & Suivez-moi</h3>
          <div className="flex justify-center gap-6 flex-wrap">
            {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-sm">📸 Instagram</a>}
            {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-sm">📘 Facebook</a>}
            {social.website && <a href={social.website} target="_blank" rel="noreferrer" className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-sm">🌐 Site Web</a>}
            {social.email && <a href={`mailto:${social.email}`} className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-sm">✉️ Email</a>}
            {social.phone && <a href={`tel:${social.phone}`} className="bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition text-sm">📞 Tél</a>}
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      {/* Sécurisation : on vérifie page avant d'accéder à showBrand */}
      {page && page.showBrand !== false && (
          <div className="text-center py-8 text-xs text-gray-500 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-center gap-4">
                  <Link to="/legal" className="hover:text-yellow-400">Mentions Légales</Link>
                  <span className="text-gray-700">|</span>
                  <a href="mailto:autofinancement.jac@gmail.com" className="hover:text-yellow-400">Contact</a>
              </div>
              <div>Propulsé par <a href="https://helioscope.fr" className="hover:text-yellow-400">Hélioscope</a></div>
          </div>
      )}

      {/* --- BOUTON SIGNALEMENT --- */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1 rounded-full text-xs border border-red-400/30 transition shadow-lg"
        >
          🚩 Signaler
        </button>
      </div>

      {/* --- MODALE SIGNALEMENT --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-red-400 mb-4">Signaler un contenu abusif</h3>
            <p className="text-sm text-gray-400 mb-4">
              Page : <span className="text-white font-bold">{page?.title}</span>
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Raison du signalement (obligatoire)..."
              className="w-full bg-black/30 p-3 rounded border border-white/10 text-white text-sm h-24"
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Annuler</button>
              <button onClick={handleSendReport} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-bold">Envoyer</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicPage;
