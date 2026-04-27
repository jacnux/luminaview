import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const UserPagesManager = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
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


  // On récupère l'objet utilisateur complet depuis le cache local
      const userStorage = localStorage.getItem('user');
      const userObject = userStorage ? JSON.parse(userStorage) : null;
      const username = userObject?.name || 'inconnu';


  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
       <div className="relative z-10 min-h-screen pb-20">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex justify-between   items-center mb-8">
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
              <div key={page._id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                <div>
                  <h2 className="text-xl font-bold">{page.title}</h2>
                  <p className="text-gray-400 text-sm">
                    /{page.slug}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${page.isPublished ? 'bg-green-800 text-green-200' : 'bg-gray-600'}`}>
                      {page.isPublished ? 'Publiée' : 'Brouillon'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/portfolio/${username}/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
                  >
                    Voir
                  </a>
                  <Link
                    to={`/dashboard/user-page-editor/${page._id}`}
                    className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-sm"
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(page._id, page.title)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                  >
                    Supprimer
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
