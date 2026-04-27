import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">

      {/* --- FOND IMAGE / GRADIENT --- */}
      <div className="absolute inset-0 z-0">
        {/* Option Image : Décommente la ligne ci-dessous et mets ton image */}
        {/* <img src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-30" alt="Background" /> */}

        {/* Option Gradient Animé (par défaut) */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-purple-900 opacity-90"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center">

        {/* Logo / Icône */}
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-sm shadow-lg shadow-yellow-500/5">
           <span className="text-4xl">☀️</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 drop-shadow-lg tracking-tighter">
          Hélioscope
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
          La plateforme tout-en-un pour les photographes. <br className="hidden sm:block" />
          <span className="text-white font-medium">Créez votre portfolio</span>, gérez vos albums et partagez vos pages personnalisées.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className="group relative bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 px-8 rounded-full transition transform hover:scale-105 shadow-lg shadow-yellow-500/20">
            Commencer gratuitement
            <span className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/50 transition"></span>
          </Link>
          <Link to="/login" className="bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/40 py-3 px-8 rounded-full transition backdrop-blur-sm">
            Connexion
          </Link>
        </div>
      </header>

      {/* --- FEATURES SECTION (Bento Grid Style) --- */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-4 text-white">Votre studio numérique</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Tout ce dont vous avez besoin pour présenter votre travail et développer votre activité.</p>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-fr">

            {/* Feature 1: Portfolio & Pages (LA FEATURE STAR) */}
            <div className="md:col-span-2 bg-gradient-to-br from-gray-800/50 to-black/50 p-8 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition duration-500 backdrop-blur-md flex flex-col justify-between group">
              <div>
                <div className="inline-block bg-yellow-500/10 text-yellow-400 p-3 rounded-lg mb-4 border border-yellow-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white group-hover:text-yellow-400 transition">Portfolio & Pages Personnalisées</h3>
                <p className="text-gray-400 mb-4">Créez votre vitrine professionnelle en quelques clics. Bannières, biographie, tarifs... Une présence web unique sans coder.</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Disponible maintenant
              </div>
            </div>

            {/* Feature 2: Albums */}
            <div className="bg-gray-800/30 p-8 rounded-2xl border border-white/10 hover:border-blue-500/30 transition duration-500 backdrop-blur-md flex flex-col justify-between group">
              <div>
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-xl font-bold mb-2 text-white">Albums Sécurisés</h3>
                <p className="text-gray-500 text-sm">Stockage illimité, liens privés et protection par mot de passe pour vos clients.</p>
              </div>
            </div>

            {/* Feature 3: Visionneuse Pro */}
            <div className="bg-gray-800/30 p-8 rounded-2xl border border-white/10 hover:border-purple-500/30 transition duration-500 backdrop-blur-md flex flex-col justify-between group">
               <div>
                <div className="text-4xl mb-4">🖼️</div>
                <h3 className="text-xl font-bold mb-2 text-white">Visionneuse Pro</h3>
                <p className="text-gray-500 text-sm">Zoom haute résolution, infos EXIF et expérience immersive pour vos visiteurs.</p>
               </div>
            </div>

            {/* Feature 4: Blog */}
            <div className="md:col-span-2 bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/40 transition duration-500 backdrop-blur-md flex flex-col md:flex-row gap-6 items-center group">
                <div className="flex-1">
                    <div className="inline-block bg-purple-500/10 text-purple-400 p-2 rounded mb-3 text-xs font-bold border border-purple-500/20">NOUVEAU</div>
                    <h3 className="text-xl font-bold mb-2 text-white">Votre Blog Intégré</h3>
                    <p className="text-gray-400 text-sm">Partagez vos actualités, tutoriels ou coulisses de shooting. Chaque utilisateur possède son propre espace blog indépendant.</p>
                </div>
                <div className="text-5xl opacity-50 group-hover:opacity-100 transition">📝</div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-gray-600 text-sm border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <p>© 2026 Hélioscope. Tous droits réservés.</p>
        <Link to="/legal" className="hover:text-white underline mt-2 inline-block text-gray-500 hover:text-gray-300 transition">Mentions Légales</Link>
      </footer>
    </div>
  );
};

export default LandingPage;
