import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminReports = () => {
  const [reports, setReports] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data);
    } catch (err) { console.error(err); }
  };

  const handleResolve = async (id: string) => {
    if(!window.confirm("Marquer ce signalement comme traité ?")) return;
    await api.patch(`/reports/${id}/resolve`);
    fetchReports();
  };

  // Fonction pour générer le lien de visualisation
  const getLink = (report: any) => {
      if(!report.targetDetails) return '#';
    /*  if(report.type === 'page') {
          return `/p/${report.targetDetails.slug}`;
      } */
      // voir la page signalée
      if (report.type === 'user_page') {
          const username = report.targetDetails.userId?.name;
          const slug = report.targetDetails.slug;
          if (!username || !slug) return '#';
          return `/portfolio/${username}/${slug}`;  // ← et non /p/
      }

      if(report.type === 'album') {
          return `/album/${report.targetDetails._id}?mode=viewer`;
      }
      return '#';
  }

  if (!user?.isAdmin) return <div className="p-8 text-red-500 text-center">Accès interdit</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-red-400">🚩 Signalements en attente ({reports.length})</h1>
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">← Retour</Link>
        </div>

        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-20">Aucun signalement en attente.</div>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r._id} className="bg-white/5 border border-red-500/20 rounded-lg p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">

                  {/* Bloc Info Cible */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded uppercase font-bold">{r.type}</span>
                        {r.targetDetails ? (
                            <span className="font-bold text-white truncate">{r.targetDetails.title}</span>
                        ) : (
                            <span className="text-gray-500 italic text-sm">Contenu supprimé</span>
                        )}
                    </div>

                    <p className="text-sm text-gray-300 mb-2 bg-black/20 p-2 rounded italic">"{r.reason}"</p>

                    {r.targetDetails && (
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Propriétaire : <span className="text-white">{r.targetDetails.userId?.name || 'Inconnu'}</span> ({r.targetDetails.userId?.email})</p>
                            <p>Signalé le : {new Date(r.createdAt).toLocaleString()}</p>
                        </div>
                    )}
                  </div>

                  {/* Bloc Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                     {r.targetDetails && (
                        <a
                            href={getLink(r)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-center text-xs bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded font-bold"
                        >
                            Voir le contenu
                        </a>
                     )}
                     <button
                        onClick={() => handleResolve(r._id)}
                        className="text-xs bg-green-600 hover:bg-green-700 px-3 py-2 rounded font-bold"
                      >
                        ✓ Marquer résolu
                      </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
