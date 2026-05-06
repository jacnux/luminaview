import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import MarkdownRenderer from '../components/MarkdownRenderer';

const BlogManager = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const { user } = useAuth();

  // --- CORRECTION ICI : Définition de blogSlug ---
  const blogSlug = user?.name?.toLowerCase() || 'unknown';
  // -----------------------------------------------

  // NOUVEAU : Fonction pour calculer l'URL publique du blog
  const getBlogPublicUrl = () => {
     const slug = blogSlug.toLowerCase(); // Utilise la variable définie ci-dessus
     if (window.location.hostname === 'localhost') {
       return `http://localhost:8080/?user=${slug}`;
     }
     // Nouveau format : jac-blog.helioscope.fr
     return `https://${slug}-blog.helioscope.fr`;
   };

  const blogUrl = getBlogPublicUrl();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/blog/posts?blog=${blogSlug}`);
      setPosts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // Ajout de blogSlug dans les dépendances pour être propre
    if (blogSlug && blogSlug !== 'unknown') {
        fetchPosts();
    }
  }, [blogSlug]);

  const handleEdit = (post: any) => {
    setEditId(post._id);
    setTitle(post.title);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Remplissez tous les champs");

    try {
      const postSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      if (editId) {
        await api.put(`/blog/posts/${editId}`, { title, content, slug: postSlug, blogSlug });
        alert("Article mis à jour !");
      } else {
        await api.post('/blog/posts', { title, content, slug: postSlug, blogSlug });
        alert("Article publié !");
      }

      setTitle('');
      setContent('');
      setEditId(null);
      fetchPosts();
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Supprimer cet article ?")) return;
    try {
      await api.delete(`/blog/posts/${id}`);
      fetchPosts();
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
            <h1 className="text-2xl font-bold text-white">Gestion du Blog</h1>
           {/* Affichage de l'URL */}
           <div className="mt-2 flex items-center gap-2">
               <span className="text-gray-400 text-sm">Adresse publique :</span>
               <a
                 href={blogUrl}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-lg font-mono text-yellow-400 hover:text-yellow-300 hover:underline transition"
               >
                 {blogUrl}
               </a>
           </div>
        </div>
      </div>

      {/* --- LAYOUT EDITOR --- */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* COLONNE GAUCHE : EDITEUR (3/5) */}
        <div className="lg:col-span-3 space-y-4">

            {/* Barre d'outils simple */}
            <div className="bg-[#111] p-2 rounded-t-lg border border-white/10 border-b-0 flex justify-between items-center">
                <span className="text-xs text-gray-500 font-mono">MARKDOWN EDITOR</span>
                <div className="flex gap-2">
                    <button type="button" onClick={() => setContent(content + ' **gras** ')} className="text-xs text-gray-400 hover:text-white font-bold">B</button>
                    <button type="button" onClick={() => setContent(content + ' *italique* ')} className="text-xs text-gray-400 hover:text-white italic">I</button>
                    <button type="button" onClick={() => setContent(content + '\n![Image](/uploads/image.jpg)')} className="text-xs text-gray-400 hover:text-white">Img</button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-[#0a0a0a] p-6 rounded-lg border border-white/10 rounded-tl-none">
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-transparent text-3xl font-bold text-white border-none focus:outline-none focus:ring-0 placeholder-gray-700"
                    placeholder="Titre de l'article..."
                />

                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full bg-black/20 min-h-[400px] p-4 rounded text-gray-300 font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-yellow-500/50 placeholder-gray-600"
                    placeholder="Écrivez votre contenu ici...

Astuce :
- Utilisez **gras** pour mettre en avant.
- Insérez des images avec ![Texte](/uploads/votre-image.jpg)
"
                />

                <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 rounded transition shadow-lg shadow-yellow-500/20">
                        {editId ? "Mettre à jour" : "Publier l'article"}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={() => { setEditId(null); setTitle(''); setContent(''); }}
                            className="px-6 py-2 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 rounded text-sm transition"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </form>
        </div>

        {/* COLONNE DROITE : APERÇU + LISTE (2/5) */}
        <div className="lg:col-span-2 space-y-6">

            {/* Aperçu en temps réel */}
            <div className="bg-[#0f0f0f] p-4 rounded-lg border border-white/10">
                <h3 className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    APERÇU EN DIRECT
                </h3>
                <div className="prose prose-sm max-w-none text-gray-300">
                    {title ? <h1 className="text-xl font-bold text-white mb-2">{title}</h1> : <p className="text-gray-600 italic">Le titre apparaîtra ici...</p>}
                    <div className="overflow-hidden prose-p:my-2 prose-headings:text-white prose-a:text-yellow-400">
                         <MarkdownRenderer>{content || "*Commencez à écrire pour voir l'aperçu...*"}</MarkdownRenderer>
                    </div>
                </div>
            </div>

            {/* Liste des articles existants */}
            <div>
                <h3 className="text-lg font-bold text-white mb-3">Articles publiés</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {loading ? <p className="text-gray-500 text-sm">Chargement...</p> : (
                        <>
                        {posts.length === 0 && <p className="text-gray-600 text-sm">Aucun article.</p>}

                        {posts.map(post => (
                          <div key={post._id} className="bg-white/5 p-3 rounded border border-white/5 hover:border-yellow-500/30 transition group">
                            <div className="flex justify-between items-center">
                              <div className="flex-1 mr-2">
                                <p className="font-bold text-gray truncate text-sm">{post.title}</p>
                                <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => handleEdit(post)} className="text-xs bg-white/10 hover:bg-blue-600 text-blue-300 hover:text-white px-2 py-1 rounded">Edit</button>
                                <button onClick={() => handleDelete(post._id)} className="text-xs bg-white/10 hover:bg-red-600 text-red-300 hover:text-white px-2 py-1 rounded">X</button>
                              </div>
                            </div>
                          </div>
                        ))}
                        </>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BlogManager;
