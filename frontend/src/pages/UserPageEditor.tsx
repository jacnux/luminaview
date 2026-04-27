import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom'; // Ajouter useParams

const UserPageEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Récupère l'ID si édition

  // État de la page
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [isPublished, setIsPublished] = useState(false);

  // Données annexes
  const [availableAlbums, setAvailableAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [loadingPage, setLoadingPage] = useState(false); // Nouveau state pour le chargement

  // Charger les données si on est en mode Édition
  useEffect(() => {
    const fetchPageData = async () => {
        if (id) {
            setLoadingPage(true);
            try {
                const res = await api.get(`/user-pages/my/${id}`);
                const pageData = res.data;

                // Remplir les states
                setTitle(pageData.title);
                setSlug(pageData.slug);
                setIsPublished(pageData.isPublished);

                // Attention : Il faut remapper les albumsIds pour le select
                // Le backend renvoie les albums populés ou juste les IDs ?
                // On suppose qu'il renvoie les IDs ou les objets.
                const formattedSections = pageData.sections.map((s: any) => ({
                    ...s,
                    albumIds: s.albumIds.map((a: any) => a._id || a) // Extrait l'ID si l'objet est peuplé
                }));
                setSections(formattedSections);

            } catch (err) {
                alert("Erreur chargement page");
                navigate('/dashboard/pages');
            } finally {
                setLoadingPage(false);
            }
        }
    };
    fetchPageData();
  }, [id, navigate]);


  // Charger les albums de l'utilisateur pour le sélecteur
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        // On récupère tous les albums, comme dans ton autre éditeur
        const res = await api.get('/albums/my/albums');
        if (Array.isArray(res.data)) {
             // On peut choisir ici de prendre tous les albums ou juste les virtuels
             // Pour un portfolio, prendre tous les albums est souvent mieux
             setAvailableAlbums(res.data);
        }
      } catch (err) {
        console.error("Erreur chargement albums", err);
      }
    };
    fetchAlbums();
  }, []);

  // Ajouter une section
  const addSection = (type: 'text' | 'gallery') => {
    const newSection = {
      type,
      content: '',
      albumIds: [],
      _id: Date.now().toString() // ID temporaire pour React
    };
    setSections([...sections, newSection]);
  };

  // Mettre à jour le contenu d'une section
  const updateSectionContent = (index: number, field: string, value: any) => {
    const updatedSections = [...sections];
    // Cas spécial pour albumIds (on veut un tableau)
    if (field === 'albumIds') {
        updatedSections[index][field] = [value];
    } else {
        updatedSections[index][field] = value;
    }
    setSections(updatedSections);
  };

  // Supprimer une section
  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Sauvegarder la page
  // Sauvegarder la page
const handleSave = async (publish = false) => {
  if (!title || !slug) {
    setMessage('Le titre et l\'URL (slug) sont obligatoires.');
    return;
  }

  setLoading(true);
  try {
    const payload = {
      id, // IMPORTANT : On envoie l'ID pour que le backend sache s'il faut updater ou créer
      title,
      slug,
      sections,
      isPublished: publish
    };

    await api.post('/user-pages/my/save', payload);

    setMessage('Page sauvegardée avec succès !');

    // Rediriger vers la liste après sauvegarde réussie
    setTimeout(() => {
        navigate('/dashboard/pages');
    }, 1000);

  } catch (err: any) {
    console.error(err);
    setMessage(err.response?.data?.error || 'Erreur lors de la sauvegarde');
  } finally {
    setLoading(false);
  }
};

  // Aide à la saisie du slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Auto-génération du slug si vide
    if (!slug) {
        setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900">
       <div className="relative z-10 min-h-screen pb-20">
          <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">
               {id ? 'Modifier la Page' : 'Créer une Page Personnelle'}
      </h1>
        <p className="text-gray-400 mb-6 text-sm">
            Créez des pages personnalisées (Tarifs, Matériel, About) accessibles via votre profil.
        </p>

        {/* Messages */}
        {message && <div className="bg-blue-600 p-3 rounded mb-4 text-center">{message}</div>}

        {/* Informations Principales */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Titre de la page</label>
            <input
              type="text"
              placeholder="Ex: Mes Tarifs, Mon Matériel"
              value={title}
              onChange={handleTitleChange}
              className="w-full p-3 bg-gray-700 rounded border border-gray-600 focus:border-yellow-500 outline-none"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">URL (Slug)</label>
            <div className="flex items-center bg-gray-700 rounded border border-gray-600">
              <span className="text-gray-500 pl-3 text-sm whitespace-nowrap">/portfolio/votre-nom/</span>
              <input
                type="text"
                placeholder="mes-tarifs"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full p-3 bg-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                id="publish"
                className="w-4 h-4"
            />
            <label htmlFor="publish" className="text-sm text-gray-400">Publier immédiatement</label>
          </div>
        </div>

        {/* Liste des Sections */}
        {sections.map((section, index) => (
          <div key={section._id} className="bg-gray-800 p-5 rounded-lg mb-4 border-l-4 border-yellow-500">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-yellow-400 uppercase text-sm">
                {section.type === 'text' ? 'Bloc Texte' : 'Bloc Galerie'}
              </span>
              <button onClick={() => removeSection(index)} className="text-red-500 hover:text-red-400 text-sm font-bold">
                Supprimer
              </button>
            </div>

            {section.type === 'text' && (
              <textarea
                placeholder="Écrivez votre contenu ici..."
                className="w-full h-32 bg-gray-700 p-3 rounded text-gray-200"
                value={section.content || ''}
                onChange={(e) => updateSectionContent(index, 'content', e.target.value)}
              />
            )}

            {section.type === 'gallery' && (
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Choisir un album à afficher :</label>
                <select
                  className="w-full bg-gray-700 p-3 rounded"
                  onChange={(e) => updateSectionContent(index, 'albumIds', e.target.value)}
                  value={section.albumIds[0] || ''}
                >
                  <option value="">-- Sélectionner --</option>
                  {availableAlbums.map(alb => (
                    <option key={alb._id} value={alb._id}>{alb.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}

        {/* Boutons Ajouter */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => addSection('text')}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold transition"
          >
            + Ajouter du Texte
          </button>
          <button
            onClick={() => addSection('gallery')}
            className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded font-bold transition"
          >
            + Ajouter une Galerie
          </button>
        </div>

        {/* Boutons Sauvegarde */}
        <div className="flex gap-4">
          <button
            onClick={() => handleSave(false)}
            disabled={loading}
            className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 rounded font-bold transition"
          >
            {loading ? 'Sauvegarde...' : 'Enregistrer le brouillon'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={loading}
            className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded font-bold transition"
          >
            {loading ? 'Publication...' : 'Sauvegarder et Publier'}
          </button>
        </div>

      </div>
    </div>
    </div>
  );
};

export default UserPageEditor;
