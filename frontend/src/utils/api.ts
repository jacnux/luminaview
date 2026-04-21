// frontend/src/utils/api.ts

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // MODIFICATION IMPORTANTE :
      // On ne redirige vers /login QUE si l'utilisateur était connecté (avait un token)
      // Sinon, c'est juste qu'il essaie d'accéder à une ressource privée sans être logué, on laisse le composant gérer l'erreur.

      const hasToken = localStorage.getItem('token');

      // Si on a un token mais qu'on reçoit 401, c'est qu'il est invalide/expiré -> On logout
      if (hasToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      // Sinon (pas de token), on ne fait rien, l'erreur est gérée par le composant (ex: "Oups! Erreur")
    }
    return Promise.reject(error);
  }
);

export default api;
