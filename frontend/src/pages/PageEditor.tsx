import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const PageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [availableAlbums, setAvailableAlbums] = useState<any[]>([]);
  const [background, setBackground] = useState('bg-black');

  // Upload Hero
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [currentHero, setCurrentHero] = useState<string>('');

  // NOUVEAU : State pour l'affichage sur le blog
  const [showOnBlog, setShowOnBlog] = useState(false);

  // Sprint 3
  const [showBrand, setShowBrand] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    instagram: '',
    facebook: '',
    website: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    api.get('/albums/my/albums').then(res => {
      if (Array.isArray(res.data)) {
         // CORRECTION : On ne garde que les galeries virtuelles
         const virtualAlbums = res.data.filter((a: any) => a.isVirtual === true);
         setAvailableAlbums(virtualAlbums);
      } else {
         setAvailableAlbums([]);
      }
    }).catch(err => console.error(err));

    if (id) {
      api.get(`/pages/mine`).then(res => {
        if (Array.isArray(res.data)) {
            const page = res.data.find((p: any) => p._id === id);
            if (page) {
              setTitle(page.title);
              setSlug(page.slug);
              setBio(page.bio);
              setBackground(page.background || 'bg-black');
              setCurrentHero(page.heroImage || '');
              setShowBrand(page.showBrand !== false);
              setSocialLinks(page.socialLinks || {});
              setSelectedAlbums(page.showcaseAlbums.map((a: any) => a._id));

              // CORRECTION : Chargement de showOnBlog
              setShowOnBlog(page.showOnBlog || false);
            }
        }
      }).catch(err => console.error(err));
    }
  }, [id]);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  /*const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!id) setSlug(generateSlug(e.target.value));
  }; */

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      // On ajoute un timestamp pour garantir l'unicité en création
      if (!id) {
        const baseSlug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
       // On ajoute 8 chiffres aléatoires pour éviter les conflits
       const randomSuffix = Math.random().toString(36).substring(2, 6);
       setSlug(`${baseSlug}-${randomSuffix}`);
      }
    };

  const toggleAlbum = (albumId: string) => {
    setSelectedAlbums(prev =>
      prev.includes(albumId) ? prev.filter(id => id !== albumId) : [...prev, albumId]
    );
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      slug,
      bio,
      showcaseAlbums: selectedAlbums,
      background,
      showBrand,
      socialLinks,
      isPublic: true,
      showOnBlog // CORRECTION : Envoi de la valeur
    };

    try {
      if (id) {
        await api.put(`/pages/${id}`, payload);
      } else {
        await api.post('/pages', payload);
      }
      navigate('/pages');
    } catch (error: any) {
      alert(error.response?.data?.error || "Erreur sauvegarde");
    }
  };

  // Fonction pour uploader le hero
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setHeroFile(file);

          const formData = new FormData();
          formData.append('hero', file);

          try {
              const res = await api.post(`/pages/upload-hero/${id}`, formData, {
                  headers: { 'Content-Type': 'multipart/form-data' }
              });
              setCurrentHero(res.data.filename);
              setHeroFile(null);
              alert('Bannière mise à jour !');
          } catch (err) {
              alert("Erreur upload bannière");
          }
      }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">{id ? 'Modifier' : 'Nouvelle'} Page</h1>

        {/* Dans la section Bannière */}
  <div className="mb-8">
      <label className="block text-sm mb-2 text-gray-300">Image de bannière (Haut de page)</label>

      <div className="relative w-full h-40 bg-white/5 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
          {currentHero ? (
              <img src={`/uploads/${currentHero}`} className="w-full h-full object-cover" alt="Bannière" />
          ) : (
              <span className="text-gray-500 text-sm">Aucune bannière</span>
          )}
      </div>

      <div className="mt-2 flex gap-2">
          {/* CORRECTION : On ne montre le bouton que si un ID existe (page déjà sauvegardée) */}
          {id ? (
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                  Changer la bannière
                  <input type="file" className="hidden" accept="image/*" onChange={handleHeroUpload} />
              </label>
          ) : (
              <p className="text-xs text-gray-500 mt-2">
                  Sauvegardez la page une première fois pour pouvoir ajouter une bannière.
              </p>
          )}

          {currentHero && (
               <button
                   onClick={async () => {
                       if(!window.confirm("Supprimer la bannière ?")) return;
                       await api.put(`/pages/${id}`, { heroImage: null });
                       setCurrentHero('');
                   }}
                   className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm"
               >
                   Supprimer
               </button>
          )}
      </div>
  </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Infos Principales */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
              <div>
                <label className="block text-sm mb-2">Titre de la page</label>
                <input type="text" value={title} onChange={handleTitleChange} className="w-full bg-white/10 p-3 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm mb-2">Slug (URL)</label>
                <input type="text" value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="w-full bg-white/10 p-3 rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm mb-2">Présentation</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg h-24" />
              </div>
          </div>

          {/* Sprint 3 : Contact & Réseaux */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-purple-300 border-b border-white/10 pb-2">Contact & Réseaux</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Instagram (URL)</label>
                      <input type="text" name="instagram" value={socialLinks.instagram} onChange={handleSocialChange} className="w-full bg-black/30 p-2 rounded text-sm" placeholder="https://instagram.com/..." />
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Facebook (URL)</label>
                      <input type="text" name="facebook" value={socialLinks.facebook} onChange={handleSocialChange} className="w-full bg-black/30 p-2 rounded text-sm" placeholder="https://facebook.com/..." />
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Site Web (URL)</label>
                      <input type="text" name="website" value={socialLinks.website} onChange={handleSocialChange} className="w-full bg-black/30 p-2 rounded text-sm" placeholder="https://monsite.com" />
                  </div>
                  <div>
                      <label className="block text-xs text-gray-400 mb-1">Email</label>
                      <input type="email" name="email" value={socialLinks.email} onChange={handleSocialChange} className="w-full bg-black/30 p-2 rounded text-sm" placeholder="contact@exemple.com" />
                  </div>
                   <div>
                      <label className="block text-xs text-gray-400 mb-1">Téléphone</label>
                      <input type="text" name="phone" value={socialLinks.phone} onChange={handleSocialChange} className="w-full bg-black/30 p-2 rounded text-sm" placeholder="+33 6 00 00 00 00" />
                  </div>
              </div>
          </div>

          {/* NOUVEAU : Option Affichage Blog */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-gray-300">Options de Publication</h3>

              <div className="flex items-center gap-3">
                  <input
                      type="checkbox"
                      id="showOnBlog"
                      checked={showOnBlog}
                      onChange={(e) => setShowOnBlog(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="showOnBlog" className="text-sm text-gray-300 cursor-pointer select-none">
                      <strong>Afficher sur le Blog</strong>
                      <span className="block text-xs text-gray-500">Cette page apparaîtra dans la section "Galeries" de ton blog personnel.</span>
                  </label>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <input
                      type="checkbox"
                      checked={showBrand}
                      onChange={(e) => setShowBrand(e.target.checked)}
                      className="w-5 h-5"
                  />
                  <span>Afficher la marque "Hélioscope" en bas de page</span>
              </label>
          </div>

          {/* Style & Albums */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
              <div>
                <label className="block text-sm mb-2">Style de la page (Fond)</label>
                <select value={background} onChange={(e) => setBackground(e.target.value)} className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white">
                  <option value="bg-black">Noir (Classique)</option>
                  <option value="bg-gradient-to-b from-purple-900 to-black">Dégradé Violet</option>
                  <option value="bg-gradient-to-b from-blue-900 to-black">Dégradé Bleu</option>
                  <option value="bg-gradient-to-b from-gray-900 to-black">Dégradé Gris</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Albums à afficher</label>
                <div className="grid grid-cols-2 gap-2 bg-black/20 p-4 rounded-lg max-h-64 overflow-y-auto">
                  {availableAlbums.map(album => (
                    <label key={album._id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedAlbums.includes(album._id)}
                        onChange={() => toggleAlbum(album._id)}
                        className="w-5 h-5"
                      />
                      <span className="text-sm truncate">{album.title}</span>
                    </label>
                  ))}
                </div>
              </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate('/pages')} className="flex-1 bg-gray-600 py-3 rounded-full">Annuler</button>
            <button type="submit" className="flex-1 bg-purple-600 py-3 rounded-full font-bold">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PageEditor;
