import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { API_PREFIX, getMainAppUrl } from '../../utils/blogApi';

const GalleryPage: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  useEffect(() => {
    fetch(`${API_PREFIX}/user/${blogSlug}`)
      .then(res => res.json())
      .then(data => setPages(data.showcaseAlbums || []))
      .catch(console.error);
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
          <a key={page._id}
            href={`${getMainAppUrl()}/portfolio/${blogSlug}/${page.slug}`}
            className="gallery-card" target="_blank" rel="noopener noreferrer"
          >
            <div className="gallery-thumb">
              {page.coverImage
                ? <img src={`/uploads/${page.coverImage}`} alt={page.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}><span style={{ fontSize: '2rem' }}>🎨</span></div>
              }
            </div>
            <div className="gallery-info"><h4 style={{ margin: 0 }}>{page.title}</h4></div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
