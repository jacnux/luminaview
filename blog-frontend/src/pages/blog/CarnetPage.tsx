import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CarnetPage: React.FC = () => {
  const location = useLocation();

  const getEmbedUrl = (): string => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) {
      return 'http://localhost:8081/embed/carnet-de-routes';
    } else {
      const rootDomain = hostname.replace(/^(blog\.|.*?-blog\.)/, '');
      return `https://${rootDomain}/embed/carnet-de-routes`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06] pb-6 mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white">Carnet de Route</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Mémoire technique & artistique de mes prises de vue</p>
        </div>
        <Link 
          to={`/${location.search}`} 
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition duration-200"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-200">&larr;</span> Retour
        </Link>
      </div>

      <div className="w-full bg-white dark:bg-slate-900/60 border border-black/[0.06] dark:border-white/[0.06] rounded-xl overflow-hidden shadow-lg" style={{ height: '700px' }}>
        <iframe 
          src={getEmbedUrl()} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen
          title="Carnet de Route"
        />
      </div>
    </div>
  );
};

export default CarnetPage;
