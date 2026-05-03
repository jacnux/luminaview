import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserAlbums, setSelectedUserAlbums] = useState<any[] | null>(null);
  const [loadingAlbums, setLoadingAlbums] = useState(false);

  // États pour les photos
  const [viewingAlbum, setViewingAlbum] = useState<any | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // États pour la gestion du Quota
  const [editingQuotaUser, setEditingQuotaUser] = useState<any | null>(null);
  const [newQuota, setNewQuota] = useState<string>('');

  // NOUVEAU : États pour la gestion de l'Email
  const [editingEmailUser, setEditingEmailUser] = useState<any | null>(null);
  const [newEmail, setNewEmail] = useState<string>('');

  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  // --- Logique Albums ---
  const handleViewAlbums = async (userId: string) => {
    setLoadingAlbums(true);
    setSelectedUserAlbums(null);
    setViewingAlbum(null);
    try {
      const res = await api.get(`/users/admin/${userId}/albums`);
      setSelectedUserAlbums(res.data);
    } catch (err) {
      alert("Impossible de charger les albums");
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleViewAlbumPhotos = async (album: any) => {
    setViewingAlbum(album);
    setLoadingPhotos(true);
    setAlbumPhotos([]);
    try {
      const res = await api.get(`/albums/photos/${album._id}`);
      setAlbumPhotos(res.data);
    } catch (err) {
      alert("Impossible de charger les photos");
    } finally {
      setLoadingPhotos(false);
    }
  };

  // --- Logique Quota ---
  const openQuotaModal = (u: any) => {
    setEditingQuotaUser(u);
    setNewQuota((u.quotaLimit / 1024 / 1024).toFixed(0));
  };

  const handleSaveQuota = async () => {
    if (!editingQuotaUser) return;
    try {
      const quotaInBytes = parseFloat(newQuota) * 1024 * 1024;
      await api.put(`/admin/users/${editingQuotaUser._id}`, { quotaLimit: quotaInBytes });
      alert("Quota mis à jour !");
      setEditingQuotaUser(null);
      fetchUsers();
    } catch (err) {
      alert("Erreur lors de la mise à jour du quota");
    }
  };

  // --- NOUVEAU : Logique Email ---
  const openEmailModal = (u: any) => {
    setEditingEmailUser(u);
    setNewEmail(u.email || '');
  };

  const handleSaveEmail = async () => {
    if (!editingEmailUser || !newEmail) return;
    try {
      // On appelle la même route que pour le quota, mais avec le champ email
      await api.put(`/admin/users/${editingEmailUser._id}`, { email: newEmail });
      alert("Email mis à jour !");
      setEditingEmailUser(null);
      fetchUsers(); // Rafraîchir la liste
    } catch (err) {
      alert("Erreur lors de la mise à jour de l'email");
    }
  };

  // --- Logique Mot de passe ---
  const handleResetPassword = async (u: any) => {
    if (!window.confirm(`Réinitialiser le mot de passe pour ${u.name} ?`)) return;
    try {
      const res = await api.post(`/admin/users/${u._id}/reset-password`);
      alert(`Mot de passe réinitialisé !\n\nNouveau mot de passe temporaire : ${res.data.newPassword}`);
    } catch (err) {
      alert("Erreur lors de la réinitialisation");
    }
  };

  // --- Logique Suppression ---
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Supprimer cet utilisateur et toutes ses données ?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  if (!user?.isAdmin) return <div className="p-8 text-red-500 text-center">Accès interdit</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-yellow-400">Gestion des Utilisateurs</h1>
          <Link to="/dashboard" className="text-sm text-gray-400 hover:text-white">← Retour</Link>
        </div>

        <div className="space-y-4">
          {users.map(u => (
            <div key={u._id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="font-bold text-white">{u.name} <span className="text-xs text-gray-500 ml-2">{u.email}</span></p>
                <p className="text-xs text-gray-400 mt-1">
                    Espace : {((u.quotaUsed || 0) / 1024 / 1024).toFixed(2)} Mo / {((u.quotaLimit || 0) / 1024 / 1024).toFixed(0)} Mo
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {/* NOUVEAU BOUTON */}
                <button onClick={() => openEmailModal(u)} className="bg-teal-600 hover:bg-teal-700 px-3 py-1 rounded text-xs font-bold">Modifier Email</button>
                <button onClick={() => openQuotaModal(u)} className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs font-bold">Modifier Quota</button>
                <button onClick={() => handleResetPassword(u)} className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-xs font-bold">Reset MDP</button>
                <button onClick={() => handleViewAlbums(u._id)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-bold">Voir albums</button>
                <button onClick={() => handleDeleteUser(u._id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-bold">Supprimer</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODALE ALBUMS & PHOTOS (Inchangé) */}
        {(loadingAlbums || selectedUserAlbums) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => { setSelectedUserAlbums(null); setViewingAlbum(null); }}>
            <div className="bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">
                    {viewingAlbum ? `Album : ${viewingAlbum.title}` : "Albums de l'utilisateur"}
                </h3>
                <button onClick={() => { setSelectedUserAlbums(null); setViewingAlbum(null); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>

              {loadingAlbums ? <p>Chargement...</p> : (
                <>
                    {viewingAlbum ? (
                        <div>
                            <button onClick={() => setViewingAlbum(null)} className="mb-4 text-sm text-blue-400 hover:text-white flex items-center gap-1">← Retour aux albums</button>
                            {loadingPhotos ? <p>Chargement des photos...</p> : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {albumPhotos.length === 0 && <p className="col-span-full text-gray-500 text-center py-8">Aucune photo.</p>}
                                    {albumPhotos.map(p => (
                                        <div key={p._id} className="aspect-square bg-black/30 rounded overflow-hidden group relative">
                                            <img src={`/uploads/${p.filename}`} className="w-full h-full object-cover" alt="Photo" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-1 transition">
                                                <span className="text-[9px] text-white truncate w-full text-center">{p.title || 'Sans titre'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedUserAlbums && selectedUserAlbums.length === 0 && <p className="col-span-3 text-gray-500 text-center py-8">Aucun album.</p>}
                            {selectedUserAlbums?.map(album => (
                                <div key={album._id} className="bg-white/5 rounded-lg overflow-hidden border border-white/5 hover:border-blue-500 transition cursor-pointer" onClick={() => handleViewAlbumPhotos(album)}>
                                <div className="aspect-square bg-black/30">
                                    {album.coverImage ? <img src={`/uploads/${album.coverImage}`} className="w-full h-full object-cover" alt="cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>}
                                </div>
                                <div className="p-2 text-xs">
                                    <p className="font-bold truncate">{album.title}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className={`text-[10px] px-1 rounded ${album.isPublic ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{album.isPublic ? 'Public' : 'Privé'}</span>
                                        <span className="text-blue-400 hover:underline text-[10px]">Voir photos →</span>
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
              )}
            </div>
          </div>
        )}

        {/* MODALE QUOTA (Inchangé) */}
        {editingQuotaUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-yellow-500/30">
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Modifier le Quota</h3>
              <p className="text-sm text-gray-400 mb-4">
                Utilisateur : <span className="text-white font-bold">{editingQuotaUser.name}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Nouveau quota (en Mo)</label>
                <input type="number" value={newQuota} onChange={(e) => setNewQuota(e.target.value)} className="w-full bg-black/30 p-3 rounded border border-white/10 text-white" placeholder="Ex: 500" />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingQuotaUser(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Annuler</button>
                <button onClick={handleSaveQuota} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-bold">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

        {/* NOUVEAU : MODALE EMAIL */}
        {editingEmailUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-sm w-full border border-teal-500/30">
              <h3 className="text-xl font-bold text-teal-400 mb-4">Modifier l'Email</h3>
              <p className="text-sm text-gray-400 mb-4">
                Utilisateur : <span className="text-white font-bold">{editingEmailUser.name}</span>
              </p>
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-1">Nouvel email</label>
                <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-black/30 p-3 rounded border border-white/10 text-white"
                    placeholder="email@exemple.com"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditingEmailUser(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Annuler</button>
                <button onClick={handleSaveEmail} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded text-sm font-bold">Sauvegarder</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
