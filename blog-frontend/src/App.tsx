import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getBlogSlug } from './utils/getBlogSlug';
import { ThemeProvider } from './context/ThemeContext';
import { useTheme } from './context/ThemeContext';

// --- UTILITAIRE : URL DYNAMIQUE ---
const getMainAppUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost';
  const cleanHost = hostname.replace(/^(blog\.|.*?-blog\.)/, '');
  return `https://${cleanHost}`;
};

const API_PREFIX = '/api/blog';

// --- FOOTER AVEC NEWSLETTER ---
const Footer = () => {
  const location = useLocation();
  const blogName = getBlogSlug(location.search);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await fetch(`${API_PREFIX}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, blogSlug: blogName })
        });
        setSubscribed(true);
    } catch(err) {
        alert('Erreur');
    }
  };

  return (
    <footer style={{ background: 'var(--bg-navbar)', borderTop: '1px solid var(--border-color)', padding: '2rem 1rem', marginTop: 'auto', textAlign: 'center' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {!subscribed ? (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <input type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field" style={{ maxWidth: '300px', textAlign: 'center' }} />
                <button type="submit" className="btn btn-primary">S'abonner</button>
            </form>
        ) : (
            <p className="text-green-400 font-bold">✅ Abonné !</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Link to={`/about${location.search}`} className="nav-link" style={{ fontSize: '0.9rem' }}>À propos</Link>
          <a href={`${getMainAppUrl()}/legal`} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: '0.9rem' }}>Mentions Légales</a>
          <Link to={`/contact${location.search}`} className="nav-link" style={{ fontSize: '0.9rem' }}>Contact</Link>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>© {new Date().getFullYear()} Hélioscope.</p>
      </div>
    </footer>
  );
};

// --- COMPONENTS (PostList, PostDetail, etc.) ---

const extractFirstImage = (content: string): string | null => {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
};

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  useEffect(() => {
    fetch(`${API_PREFIX}/posts?blog=${blogSlug}`)
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [blogSlug]);

  if (loading) return <div className="container text-center mt-4">Chargement...</div>;

  const latestPost = posts[0];
  const otherPosts = posts.slice(1);

  return (
    <div className="container">
      {posts.length === 0 ? (<p className="text-center text-muted">Aucun article.</p>) : (
        <>
          {latestPost && (
            <Link to={`/post/${latestPost.slug}${location.search}`} key={latestPost._id} className="card-link" style={{ marginBottom: '2rem' }}>
              <article className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {extractFirstImage(latestPost.content) && ( <div style={{ flex: '1 1 300px', minHeight: '250px', backgroundImage: `url(${extractFirstImage(latestPost.content)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /> )}
                <div style={{ flex: '2 1 300px', padding: '2rem' }}>
                  <span className="card-date" style={{ color: '#fbbf24', fontWeight: 'bold' }}>ARTICLE RÉCENT</span>
                  <h2 className="card-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{latestPost.title}</h2>
                  <p className="card-excerpt">{latestPost.content.replace(/[#*`!\[\]()]/g, '').substring(0, 250)}...</p>
                </div>
              </article>
            </Link>
          )}
          <div className="gallery-grid">
            {otherPosts.map(post => {
              const img = extractFirstImage(post.content);
              return (
                <Link to={`/post/${post.slug}${location.search}`} key={post._id} className="card-link">
                  <article className="card">
                    {img && (<div style={{ height: 150, marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>)}
                    <h3 className="card-title" style={{ fontSize: '1.2rem' }}>{post.title}</h3>
                    <span className="card-date">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
                  </article>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`${API_PREFIX}/posts/${slug}`)
        .then(res => res.json())
        .then(data => { setPost(data); setLoading(false); })
        .catch(err => { console.error(err); setLoading(false); });
    }
  }, [slug]);

  if (loading) return <div className="container text-center mt-4">Chargement...</div>;
  if (!post) return <div className="container text-center mt-4">Article non trouvé</div>;

  return (
    <div className="container">
      <Link to={`/${location.search}`} className="btn btn-ghost mb-4">&larr; Retour</Link>
      <article className="card"><h1 className="card-title">{post.title}</h1><div className="prose"><ReactMarkdown>{post.content}</ReactMarkdown></div></article>
    </div>
  );
};

const AboutPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  useEffect(() => {
    fetch(`${API_PREFIX}/user/${blogSlug}`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [blogSlug]);

  if (!profile) return <div className="container text-center mt-4">Chargement...</div>;

  return (
    <div className="container text-center">
      {profile.avatar && (<img src={`/uploads/${profile.avatar}`} alt="Avatar" className="about-avatar" style={{ display: 'block', margin: '0 auto 1.5rem' }} />)}
      <h2>{profile.name}</h2>
      <div className="prose max-w-2xl mx-auto text-left"><ReactMarkdown>{profile.bio || "Aucune bio."}</ReactMarkdown></div>
      <Link to={`/${location.search}`} className="btn btn-ghost mt-4">← Retour</Link>
    </div>
  );
};

const GalleryPage: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  useEffect(() => {
    fetch(`${API_PREFIX}/user/${blogSlug}`)
      .then(res => res.json())
      .then(data => setPages(data.showcaseAlbums || []))
      .catch(err => console.error(err));
  }, [blogSlug]);

  return (
    <div className="container">
      <div className="text-center mb-4">
        <h2>Mes Galeries</h2>
        <Link to={`/${location.search}`} className="btn btn-ghost">← Retour</Link>
      </div>
      <div className="gallery-grid">
        {pages.length === 0 && <p className="text-center text-muted">Aucune galerie.</p>}
        {pages.map((page: any) => (
          <a key={page._id} href={`${getMainAppUrl()}/portfolio/${blogSlug}/${page.slug}`} className="gallery-card" target="_blank" rel="noopener noreferrer">
            <div className="gallery-thumb">
               {page.coverImage ? (<img src={`/uploads/${page.coverImage}`} alt={page.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />) : (<div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#333'}}><span style={{fontSize: '2rem'}}>🎨</span></div>)}
            </div>
            <div className="gallery-info"><h4 style={{margin:0}}>{page.title}</h4></div>
          </a>
        ))}
      </div>
    </div>
  );
};

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_PREFIX}/contact`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ...form, blogSlug }) })
      .then(() => setSent(true))
      .catch(() => alert("Erreur envoi"));
  };

  if (sent) return <div className="container text-center mt-4"><h3>Message envoyé !</h3><Link to={`/${location.search}`} className="btn btn-ghost">Retour</Link></div>;

  return (
    <div className="container" style={{maxWidth: '600px'}}>
      <h2 className="text-center">Me contacter</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="input-group"><label className="input-label">Votre nom</label><input type="text" required onChange={e => setForm({...form, name: e.target.value})} className="input-field" /></div>
        <div className="input-group"><label className="input-label">Votre email</label><input type="email" required onChange={e => setForm({...form, email: e.target.value})} className="input-field" /></div>
        <div className="input-group"><label className="input-label">Message</label><textarea rows={5} required onChange={e => setForm({...form, message: e.target.value})} className="input-field" style={{resize: 'vertical'}}></textarea></div>
        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Envoyer</button>
      </form>
    </div>
  );
};

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Thème">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// --- APP COMPONENT ---
// Note: useLocation() nécessite que ce composant soit DANS un Router.
// Comme index.tsx ne le fait pas, on le wrappe ici.
const AppContent = () => {
  const location = useLocation();
  const blogName = getBlogSlug(location.search);

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center mx-auto">
            <Link to={`/${location.search}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-yellow-500 transition">Blog de {blogName.toUpperCase()}</Link>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Link to={`/${location.search}`} className="nav-link">Articles</Link>
              <Link to={`/about${location.search}`} className="nav-link">Bio</Link>
              <Link to={`/gallery${location.search}`} className="nav-link">Galeries</Link>
              <a href={`${getMainAppUrl()}/portfolio/${blogName}`} target="_blank" rel="noopener noreferrer" className="nav-link">Portfolio</a>
              <Link to={`/contact${location.search}`} className="nav-link">Contact</Link>
              <DarkModeToggle />
            </div>
          </div>
        </nav>

        <main style={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

// On exporte le composant enveloppé dans le Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App;
