import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { API_PREFIX } from '../../utils/blogApi';

const extractFirstImage = (content: string): string | null => {
  const match = content.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : null;
};

const PostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);
  const s = location.search;

  useEffect(() => {
    fetch(`${API_PREFIX}/posts?blog=${blogSlug}`)
      .then(res => res.json())
      .then(data => { setPosts(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [blogSlug]);

  if (loading) return <div className="container text-center mt-4">Chargement...</div>;
  if (posts.length === 0) return <p className="container text-center text-muted">Aucun article.</p>;

  const [latest, ...others] = posts;
  const latestImg = extractFirstImage(latest.content);

  return (
    <div className="container">
      {/* Article mis en avant */}
      <Link to={`/post/${latest.slug}${s}`} className="card-link" style={{ marginBottom: '2rem' }}>
        <article className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          {latestImg && (
            <div style={{ flex: '1 1 300px', minHeight: '250px', backgroundImage: `url(${latestImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          )}
          <div style={{ flex: '2 1 300px', padding: '2rem' }}>
            <span className="card-date" style={{ color: '#fbbf24', fontWeight: 'bold' }}>ARTICLE RÉCENT</span>
            <h2 className="card-title" style={{ fontSize: '2rem', marginTop: '0.5rem' }}>{latest.title}</h2>
            <p className="card-excerpt">{latest.content.replace(/[#*`!\[\]()]/g, '').substring(0, 250)}...</p>
          </div>
        </article>
      </Link>

      {/* Grille des autres articles */}
      <div className="gallery-grid">
        {others.map(post => {
          const img = extractFirstImage(post.content);
          return (
            <Link to={`/post/${post.slug}${s}`} key={post._id} className="card-link">
              <article className="card">
                {img && (
                  <div style={{ height: 150, marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <h3 className="card-title" style={{ fontSize: '1.2rem' }}>{post.title}</h3>
                <span className="card-date">{new Date(post.createdAt).toLocaleDateString('fr-FR')}</span>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;
