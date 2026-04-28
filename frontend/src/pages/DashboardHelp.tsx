import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DashboardHelp: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // On va chercher le fichier markdown dans le dossier public
    fetch('/help.md')
      .then(res => {
        if (!res.ok) throw new Error('Fichier non trouvé');
        return res.text();
      })
      .then(text => {
        setContent(text);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setContent("# Erreur\nImpossible de charger l'aide.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white">Chargement...</div>;

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
       <div className="relative z-10 min-h-screen pb-20">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 py-8">
            <article className="prose prose-invert prose-yellow max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          </div>
       </div>
    </div>
  );
};

export default DashboardHelp;
