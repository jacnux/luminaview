import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* HERO SECTION */}
      <header className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg relative z-10">
          Hélioscope
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl relative z-10">
          La plateforme de portfolios pour les photographes. Partagez vos albums, créez vos galeries et racontez vos histoires.
        </p>
        <div className="flex gap-4 relative z-10">
          <Link to="/register" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition transform hover:scale-105">
            Commencer
          </Link>
          <Link to="/login" className="border border-white/30 hover:border-white hover:text-white py-3 px-8 rounded-full transition">
            Connexion
          </Link>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className="py-16 px-4 bg-white/5 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-yellow-400">Tout ce dont vous avez besoin</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Albums */}
            <div className="bg-black/30 p-8 rounded-xl border border-white/10 hover:border-yellow-500/50 transition hover:-translate-y-2 duration-300">
              <div className="text-4xl mb-4">📸</div>
              <h3 className="text-xl font-bold mb-2">Albums & Galeries</h3>
              <p className="text-gray-400">Créez des albums privés ou publics. Intégrez-les facilement sur votre site WordPress.</p>
            </div>

            {/* Feature 2: Pages */}
            <div className="bg-black/30 p-8 rounded-xl border border-white/10 hover:border-yellow-500/50 transition hover:-translate-y-2 duration-300">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-bold mb-2">Pages de Présentation</h3>
              <p className="text-gray-400">Créez des pages dynamiques (Bio, Contact, Tarifs) sans toucher une ligne de code.</p>
            </div>

            {/* Feature 3: Blog (NOUVEAU) */}
            <div className="bg-black/30 p-8 rounded-xl border border-purple-500/30 hover:border-purple-500 transition hover:-translate-y-2 duration-300 relative">
              <span className="absolute top-0 right-0 bg-purple-600 text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">NOUVEAU</span>
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Votre Blog Personnel</h3>
              <p className="text-gray-400">Partagez vos actualités, coulisses et articles. Chaque utilisateur possède son propre blog.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-500 text-sm border-t border-white/5">
        <p>© 2026 Hélioscope. Tous droits réservés.</p>
        <Link to="/legal" className="hover:text-white underline mt-2 inline-block">Mentions Légales</Link>
      </footer>
    </div>
  );
};

export default LandingPage;
