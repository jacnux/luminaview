import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { getMainAppUrl, API_PREFIX } from '../../utils/blogApi';

const Footer: React.FC = () => {
  const location = useLocation();
  const blogName = getBlogSlug(location.search);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const s = location.search;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_PREFIX}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, blogSlug: blogName })
      });
      setSubscribed(true);
    } catch {
      alert('Erreur lors de l\'abonnement');
    }
  };

  return (
    <footer style={{ background: 'var(--bg-navbar)', borderTop: '1px solid var(--border-color)', padding: '2rem 1rem', marginTop: 'auto', textAlign: 'center' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {!subscribed ? (
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email" placeholder="Votre email" value={email} required
              onChange={e => setEmail(e.target.value)}
              className="input-field" style={{ maxWidth: '300px', textAlign: 'center' }}
            />
            <button type="submit" className="btn btn-primary">S'abonner</button>
          </form>
        ) : (
          <p className="text-green-400 font-bold">✅ Abonné !</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <Link to={`/about${s}`} className="nav-link" style={{ fontSize: '0.9rem' }}>À propos</Link>
          <a href={`${getMainAppUrl()}/legal`} target="_blank" rel="noopener noreferrer" className="nav-link" style={{ fontSize: '0.9rem' }}>Mentions Légales</a>
          <Link to={`/contact${s}`} className="nav-link" style={{ fontSize: '0.9rem' }}>Contact</Link>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          © {new Date().getFullYear()} Hélioscope.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
