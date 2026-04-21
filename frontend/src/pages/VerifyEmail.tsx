import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Vérification de votre compte en cours...');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      api.get(`/auth/verify-email?token=${token}`)
        .then(res => {
            setMessage(res.data.message);
            setTimeout(() => navigate('/login'), 3000);
        })
        .catch(err => {
            setError(err.response?.data?.error || 'Erreur lors de la vérification');
        });
    } else {
        setError('Aucun token fourni.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-yellow-400 mb-4">Vérification Email</h1>
      {error ? (
        <div className="text-red-400 text-center">
            <p>{error}</p>
            <Link to="/login" className="mt-4 inline-block text-blue-400 underline">Retour</Link>
        </div>
      ) : (
        <div className="text-center">
            <p>{message}</p>
            <p className="text-xs text-gray-500 mt-2">Redirection automatique...</p>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
