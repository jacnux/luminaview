import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const UserPagesManager = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Récupération du username pour les liens
  const userStorage = localStorage.getItem('user');
  const userObject = userStorage ? JSON.parse(userStorage) : null;
  const username = userObject?.name || 'inconnu';

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      // On récupère la liste qui contient maintenant isPublished et showOnBlog
      const res = await api.get('/user-pages/my/list');
      setPages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Supprimer "${title}" ?`)) return;
    try {
      await api.delete(`/user-pages/my/${id}`);
      setPages(pages.filter(p => p._id !== id));
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  // Fonction pour copier le lien public
  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/portfolio/${username}/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Lien copié !\n\n' + url);
    });
  };

  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
       <div className="relative z-10 min-h-screen pb-20">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">

            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-yellow-400">Mes Pages</h1>
              <Link
                to="/dashboard/user-page-editor"
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded font-bold"
              >
                + Nouvelle Page
              </Link>
            </div>

            {pages.length === 0 ? (
              <p className="text-center text-gray-500">Aucune page créée.</p>
            ) : (
              <div className="space-y-4">
                {pages.map(page => (
                  <div key={page._id} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-700 gap-4">

                    {/* Gauche : Info et Badges */}
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{page.title}</h2>
                      <p className="text-gray-400 text-sm">/{page.slug}</p>

                      {/* Badges de statut */}
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${page.isPublished ? 'bg-green-800 text-green-200' : 'bg-gray-700 text-gray-400'}`}>
                          {page.isPublished ? '✓ Portfolio' : '✕ Portfolio'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${page.showOnBlog ? 'bg-blue-800 text-blue-200' : 'bg-gray-700 text-gray-400'}`}>
                          {page.showOnBlog ? '✓ Blog' : '✕ Blog'}
                        </span>
                      </div>
                    </div>

                    {/* Droite : Actions */}
                    <div className="flex gap-2 flex-wrap justify-end">
                      {/* BOUTON PARTAGER */}
                      <button
                        onClick={() => copyLink(page.slug)}
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm text-white"
                      >
                        Partager
                      </button>

                      <a
                        href={`/portfolio/${username}/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm text-white"
                      >
                        Voir
                      </a>
                      <Link
                        to={`/dashboard/user-page-editor/${page._id}`}
                        className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-sm text-black font-bold"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(page._id, page.title)}
                        className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm text-white"
                      >
                        Suppr.
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
       </div>
    </div>
  );
};

export default UserPagesManager;
