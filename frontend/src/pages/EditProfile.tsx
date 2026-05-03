import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const EditProfile = () => {
  const [bio, setBio] = useState('');
  const [portfolioIntro, setPortfolioIntro] = useState('');
  const [servicesDescription, setServicesDescription] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [currentBanner, setCurrentBanner] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await api.get('/users/me');
      setBio(profileRes.data.bio || '');
      setPortfolioIntro(profileRes.data.portfolioIntro || '');
      setServicesDescription(profileRes.data.servicesDescription || '');
      setCurrentAvatar(profileRes.data.avatar || '');
      setCurrentBanner(profileRes.data.bannerImage || '');
    } catch (error) {
      console.error(error);
      alert("Erreur chargement profil");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('portfolioIntro', portfolioIntro);
      formData.append('servicesDescription', servicesDescription);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (bannerFile) formData.append('banner', bannerFile);

      await api.put('/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Profil mis à jour !');
      setBannerFile(null);
      setAvatarFile(null);
      fetchData();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-400 drop-shadow-lg">Mon Profil</h1>
            <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white transition">← Retour</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Section Présentation */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-6">

            {/* BANNIERE */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Image de couverture (Portfolio)</label>
                <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-800 relative group">
                    {(bannerFile || currentBanner) ? (
                        <img
                            src={bannerFile ? URL.createObjectURL(bannerFile) : `/uploads/${currentBanner}`}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                            alt="Bannière"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-700">
                            Cliquez pour ajouter une bannière
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={e => setBannerFile(e.target.files ? e.target.files[0] : null)}
                    className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-yellow-600 file:text-white hover:file:bg-yellow-700 cursor-pointer"
                />
            </div>

            {/* AVATAR */}
            <div className="flex flex-col sm:flex-row gap-6 items-center border-t border-white/10 pt-6">
                <div className="flex-shrink-0">
                    {currentAvatar || avatarFile ? (
                        <img
                            src={avatarFile ? URL.createObjectURL(avatarFile) : `/uploads/${currentAvatar}`}
                            className="w-24 h-24 rounded-full object-cover border-2 border-purple-500"
                            alt="Avatar"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-purple-900 flex items-center justify-center text-3xl">?</div>
                    )}
                </div>
                <div className="flex-1 w-full">
                    <label className="block text-sm font-medium mb-1 text-gray-300">Changer l'avatar</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setAvatarFile(e.target.files ? e.target.files[0] : null)}
                        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    />
                </div>
            </div>

            {/* BIO */}
            <div className="border-t border-white/10 pt-6">
                <label className="block text-sm font-medium mb-1 text-gray-300">Biographie</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={4}
                  className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none"
                  placeholder="Présentez-vous en quelques mots..."
                />
            </div>

            {/* INTRO PORTFOLIO */}
            <div className="border-t border-white/10 pt-6">
                 <label className="block text-sm font-medium mb-1 text-gray-300">Introduction Portfolio</label>
                 <textarea
                   value={portfolioIntro}
                   onChange={e => setPortfolioIntro(e.target.value)}
                   rows={2}
                   className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none"
                   placeholder="Court texte affiché en haut de votre portfolio..."
                 />
            </div>

            {/* SERVICES */}
            <div className="border-t border-white/10 pt-6">
                 <label className="block text-sm font-medium mb-1 text-gray-300">Projets-Services</label>
                 <textarea
                   value={servicesDescription}
                   onChange={e => setServicesDescription(e.target.value)}
                   rows={6}
                   className="w-full bg-black/30 border border-white/10 p-3 rounded-lg text-white focus:ring-1 focus:ring-purple-500 outline-none"
                   placeholder="Décrivez vos projets, tarifs, conditions... (Affiché dans l'onglet Services)"
                 />
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-4 rounded-full font-bold text-lg shadow-lg hover:scale-[1.02] transition">
            Sauvegarder le profil
          </button>
        </form>

        {/* NOTE : La gestion des pages a été déplacée vers le menu "Mes Pages" du Dashboard */}
      </div>
    </div>
  );
};

export default EditProfile;
