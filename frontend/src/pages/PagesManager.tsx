import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const PagesManager = () => {
  const [pages, setPages] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await api.get('/pages/mine');
      setPages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Supprimer la page "${title}" ?`)) return;
    try {
      await api.delete(`/pages/${id}`);
      fetchPages();
    } catch (error) {
      alert('Erreur suppression');
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url).then(() => alert('Lien copié !'));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400">Mes Pages de Présentation</h1>
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">← Retour</Link>
        </div>

        <button
          onClick={() => navigate('/pages/edit')}
          className="mb-8 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-lg"
        >
          + Créer une nouvelle page
        </button>

        <div className="space-y-4">
          {pages.map(page => (
            <div key={page._id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{page.title}</h3>
                <p className="text-xs text-gray-400">/{page.slug}</p>
              </div>
              <div className="flex gap-2">
                {/* NOUVEAU : BOUTON VOIR */}
                <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded"
                >
                    Voir
                </a>
                <button onClick={() => copyLink(page.slug)} className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">Partager</button>
                <button onClick={() => navigate(`/pages/edit/${page._id}`)} className="text-sm bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded">Modifier</button>
                <button onClick={() => handleDelete(page._id, page.title)} className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1 rounded">Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PagesManager;
