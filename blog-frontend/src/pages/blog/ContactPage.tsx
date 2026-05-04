import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { API_PREFIX } from '../../utils/blogApi';

const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_PREFIX}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, blogSlug })
      });
      setSent(true);
    } catch {
      alert('Erreur lors de l\'envoi');
    }
  };

  if (sent) return (
    <div className="container text-center mt-4">
      <h3>Message envoyé !</h3>
      <Link to={`/${location.search}`} className="btn btn-ghost">Retour</Link>
    </div>
  );

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h2 className="text-center">Me contacter</h2>
      <form onSubmit={handleSubmit} className="card">
        <div className="input-group">
          <label className="input-label">Votre nom</label>
          <input type="text" required className="input-field"
            onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Votre email</label>
          <input type="email" required className="input-field"
            onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="input-group">
          <label className="input-label">Message</label>
          <textarea rows={5} required className="input-field" style={{ resize: 'vertical' }}
            onChange={e => setForm({ ...form, message: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Envoyer</button>
      </form>
    </div>
  );
};

export default ContactPage;
