import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { API_PREFIX } from '../../utils/blogApi';

const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_PREFIX}/posts/${slug}`)
      .then(res => res.json())
      .then(data => { setPost(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="container text-center mt-4">Chargement...</div>;
  if (!post)   return <div className="container text-center mt-4">Article non trouvé</div>;

  return (
    <div className="container">
      <Link to={`/${location.search}`} className="btn btn-ghost mb-4">&larr; Retour</Link>
      <article className="card">
        <h1 className="card-title">{post.title}</h1>
        <div className="prose"><ReactMarkdown>{post.content}</ReactMarkdown></div>
      </article>
    </div>
  );
};

export default PostDetail;
