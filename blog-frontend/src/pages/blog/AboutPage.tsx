import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { API_PREFIX } from '../../utils/blogApi';

const AboutPage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  useEffect(() => {
    fetch(`${API_PREFIX}/user/${blogSlug}`)
      .then(res => res.json())
      .then(setProfile)
      .catch(console.error);
  }, [blogSlug]);

  if (!profile) return <div className="container text-center mt-4">Chargement...</div>;

  return (
    <div className="container text-center">
      {profile.avatar && (
        <img src={`/uploads/${profile.avatar}`} alt="Avatar" className="about-avatar"
          style={{ display: 'block', margin: '0 auto 1.5rem' }} />
      )}
      <h2>{profile.name}</h2>
      <div className="prose max-w-2xl mx-auto text-left">
        <MarkdownRenderer className="prose">{profile.bio || 'Aucune bio.'}</MarkdownRenderer>
      </div>
      <Link to={`/${location.search}`} className="btn btn-ghost mt-4">← Retour</Link>
    </div>
  );
};

export default AboutPage;
