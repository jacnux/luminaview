import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {

      const res = await api.get('/blog/comments/pending');
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approve = async (id: string) => {
    try {

      await api.patch(`/blog/comments/${id}/approve`);
      setComments(comments.filter(c => c._id !== id));
    } catch (err) {
      alert('Erreur');
    }
  };

  const del = async (id: string) => {
    if(!window.confirm('Supprimer ?')) return;
    try {
      // CORRECTION : On retire '/blog'
      await api.delete(`/blog/comments/${id}`);
      setComments(comments.filter(c => c._id !== id));
    } catch (err) {
      alert('Erreur');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">Modération des commentaires</h3>
      {comments.length === 0 ? <p className="text-gray-400">Aucun commentaire en attente.</p> : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c._id} className="bg-white/5 p-4 rounded border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="font-bold">{c.name}</span>
                <span className="text-xs text-gray-500">Sur: {c.postId?.title}</span>
              </div>
              <p className="mb-3 text-gray-300">{c.content}</p>
              <div className="flex gap-2">
                <button onClick={() => approve(c._id)} className="btn btn-primary text-sm">Approuver</button>
                <button onClick={() => del(c._id)} className="btn btn-ghost text-sm border-red-500 text-red-400">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentModeration;
