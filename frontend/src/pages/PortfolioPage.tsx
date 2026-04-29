import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext'; // 1. AJOUTER L'IMPORT

const PortfolioPage = () => {
  const { username } = useParams<{ username: string }>();

  // 1. On récupère l'utilisateur connecté sous le nom 'authUser' pour ne pas écraser l'autre variable
  const { user: authUser } = useAuth();

  // 2. On garde les states pour le propriétaire du portfolio
  const [user, setUser] = useState<any>(null); // ATTENTION : Cette ligne manquait dans ton code !
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('projects');
  const [userPages, setUserPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get(`/albums/portfolio/${username}`);
        setUser(res.data.user);
        setAlbums(res.data.albums);
        // Chargement des pages perso
        api.get(`/user-pages/${username}`).then(res => {
            setUserPages(res.data);
            }).catch(() => {});

        } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  // Détermine le lien de retour
  const backLink = user ? '/dashboard' : '/';
  const backText = user ? '← Dashboard' : '← Retour au site';

  if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Chargement...</div>;
  if (!user) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Utilisateur introuvable</div>;

  const tagline = user.bio ? user.bio.split('.')[0] + '.' : 'Photographe & Créateur Visuel';



  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">

      {/* --- HERO HEADER --- */}
      <div className="relative w-full bg-gray-800 overflow-hidden">
          <div className="h-64 md:h-80 w-full">
            {user.bannerImage ? (
                <img
                    src={`/uploads/${user.bannerImage}`}
                    className="w-full h-full object-cover opacity-60"
                    alt="Bannière"
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black"></div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-sm flex items-center px-6 md:px-12">
              <div className="absolute -bottom-2 left-8 md:left-12">
                  {user.avatar ? (
                      <img
                          src={`/uploads/${user.avatar}`}
                          className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-900 shadow-xl object-cover bg-gray-700"
                          alt="Avatar"
                      />
                  ) : (
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-900 shadow-xl bg-gray-700 flex items-center justify-center text-4xl">👤</div>
                  )}
              </div>
              <div className="ml-36 md:ml-44 flex-1 flex justify-between items-center">
                     <div>
                         <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
                             {user.name}
                         </h1>
                         <p className="text-sm md:text-base text-gray-300 mt-1 italic drop-shadow">{tagline}</p>
                     </div>

                     {/* SOLUTION FINALE : On cast authUser en 'any' pour accéder à .id */}
                     {authUser && String((authUser as any)?.id) === String(user._id) ? (
                         <Link to="/dashboard" className="text-xs text-gray-300 hover:text-white bg-white/10 px-3 py-2 rounded-full transition hidden sm:block">
                             ← Dashboard
                         </Link>
                     ) : (
                         <Link to="/" className="text-xs text-gray-300 hover:text-white bg-white/10 px-3 py-2 rounded-full transition hidden sm:block">
                             ← Retour au site
                         </Link>
                     )}
                  </div>

          </div>
      </div>

      <div className="h-12 bg-gray-900"></div>

            {/* --- BARRE D'ONGLETS --- */}
      <div className="max-w-7xl mx-auto px-4 border-b border-gray-800 mb-10">
          <div className="flex justify-center gap-2 md:gap-4 flex-wrap">
              {/* Onglet Projets */}
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-3 text-sm font-bold rounded-t-lg transition ${activeTab === 'projects' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-white'}`}
              >
                Projets
              </button>
              {/* Onglet À propos */}
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 text-sm font-bold rounded-t-lg transition ${activeTab === 'about' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-white'}`}
              >
                À propos
              </button>
              {/* Onglet Blog (externe) */}
                    <a
                      href={`https://blog.helioscope.fr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 text-sm font-bold rounded-t-lg transition text-gray-500 hover:text-white cursor-pointer"
                    >
                      Blog
                    </a>

              {/* NOUVEAU : Boucle sur les pages perso pour créer des onglets */}
              {userPages.map(p => (
                      <Link
                        key={p._id}
                        to={`/portfolio/${username}/${p.slug}`}
                        className="px-6 py-3 text-sm font-bold rounded-t-lg transition text-gray-500 hover:text-white cursor-pointer"
                      >
                        {p.title}
                      </Link>
                ))}

              {/* Onglet Services */}
              <button
                  onClick={() => setActiveTab('services')}
                  className={`px-6 py-3 text-sm font-bold rounded-t-lg transition ${activeTab === 'services' ? 'bg-gray-800 text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500 hover:text-white'}`}
              >
                  Mes Actualités
              </button>
          </div>
      </div>

      {/* --- CONTENU ONGLETS --- */}
      <div className="max-w-7xl mx-auto px-4 pb-24">

          {/* ONGLET PROJETS */}
          {activeTab === 'projects' && (
             <div>
                {user.portfolioIntro ? (
                    <p className="text-center text-gray-400 mb-10 text-lg">{user.portfolioIntro}</p>
                ) : (
                    <p className="text-center text-gray-500 mb-10 text-lg italic">Découvrez mes projets.</p>
                )}

                {albums.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">Aucun album mis en avant.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {albums.map(album => (
                          <Link to={`/album/${album._id}?mode=viewer`} key={album._id} className="group block">
                              <div className="relative overflow-hidden rounded-xl shadow-2xl bg-gray-800 transform transition duration-500 group-hover:scale-[1.02] group-hover:shadow-yellow-500/10">
                                  <div className="aspect-[4/3] overflow-hidden">
                                      {album.coverImage ? (
                                          <img src={`/uploads/${album.coverImage}`} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={album.title} />
                                      ) : (
                                          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-4xl">📷</div>
                                      )}
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-6">
                                          <div>
                                              <h3 className="text-2xl font-bold text-white">{album.title}</h3>
                                              <p className="text-gray-300 text-sm mt-1 line-clamp-2">{album.description}</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="p-4 group-hover:opacity-0 transition absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                                      <h3 className="text-lg font-bold text-white drop-shadow-lg">{album.title}</h3>
                                  </div>
                              </div>
                          </Link>
                        ))}
                    </div>
                )}
             </div>
          )}

          {/* ONGLET A PROPOS */}
              {activeTab === 'about' && (
                 <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-800/50 backdrop-blur border border-white/10 rounded-xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-yellow-400 mb-6">À propos de {user.name}</h2>
                        {user.bio ? (
                              // AJOUT DES CLASSES 'prose prose-invert' pour le style Markdown
                              <div className="prose prose-invert max-w-none">
                                 <ReactMarkdown>{user.bio}</ReactMarkdown>
                              </div>
                        ) : (
                            <p className="text-gray-500 italic">Aucune biographie renseignée.</p>
                        )}
                        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                            <a href={`mailto:${user.email}`} className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-bold transition text-lg">
                                Me contacter
                            </a>
                        </div>
                    </div>
                 </div>
              )}

          {/* ONGLET SERVICES */}
          {activeTab === 'services' && (
             <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur border border-white/10 rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-6">Actualités</h2>
                    {user.servicesDescription ? (
                          <div className="prose prose-invert max-w-none pl-6 pr-4">
                            <ReactMarkdown>{user.servicesDescription}</ReactMarkdown>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Informations non renseignées.</p>
                    )}
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center">
                        <a href={`mailto:${user.email}`} className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-bold transition text-lg">
                            Demander un devis
                        </a>
                    </div>
                </div>
             </div>
          )}
       </div>

       {/* BOUTON FLOTTANT */}
       <a href={`mailto:${user.email}`} className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-black p-4 rounded-full shadow-2xl flex items-center gap-2 font-bold text-sm transition transform hover:scale-110 z-50" title="Me contacter">
          <span>✉️</span>
          <span className="hidden sm:inline">Me Contacter</span>
       </a>

       <div className="text-center py-10 border-t border-gray-800 mt-10 text-gray-600 text-sm">
          © {new Date().getFullYear()} {user.name}. Portfolio Hélioscope.
       </div>
    </div>
  );
};

export default PortfolioPage;
