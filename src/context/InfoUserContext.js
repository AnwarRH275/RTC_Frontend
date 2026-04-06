import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';
import { API_BASE_URL } from '../services/config';

// Création du contexte
const InfoUserContext = createContext();

// Intervalle de vérification de session (60 secondes)
const SESSION_CHECK_INTERVAL = 60 * 1000;

// Provider du contexte
export function InfoUserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour forcer la déconnexion quand le compte n'existe plus
  const forceLogout = useCallback(() => {
    setUserInfo(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    window.location.href = '/connexion-tcf?session_expired=true';
  }, []);

  // Fonction pour charger les informations utilisateur
  const loadUserInfo = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser(forceRefresh);
      setUserInfo(userData);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des informations utilisateur:', err);
      setError('Impossible de charger les informations utilisateur');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour les informations utilisateur
  const updateUserInfo = async (userData) => {
    try {
      await authService.updateUser(userData);
      await loadUserInfo(true); // Forcer le refresh depuis l'API après la mise à jour
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à jour des informations utilisateur:', err);
      return { success: false, error: err.message };
    }
  };

  // Fonction pour effacer les informations utilisateur (déconnexion)
  const clearUserInfo = () => {
    setUserInfo(null);
    setLoading(false);
    setError(null);
  };

  // Charger les informations utilisateur au montage du composant
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUserInfo();
    } else {
      setLoading(false);
    }
  }, []);

  // Vérification périodique de la validité de la session (compte toujours existant)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const checkSession = async () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.status === 401 || response.status === 422 || response.status === 404) {
          // Token invalide ou compte supprimé → déconnexion
          console.warn('Session invalide détectée, déconnexion...');
          forceLogout();
        } else if (response.status === 500) {
          // Possible compte supprimé (flask-restx peut retourner 500)
          try {
            const data = await response.json();
            if (data?.msg?.includes('Session') || data?.msg?.includes('revoked')) {
              console.warn('Token révoqué détecté (500), déconnexion...');
              forceLogout();
            }
          } catch (e) { /* ignore */ }
        }
      } catch (err) {
        // Erreur réseau, ignorer (l'utilisateur est peut-être hors ligne)
        console.warn('Vérification de session échouée (réseau):', err);
      }
    };

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [forceLogout]);

  // Valeur du contexte
  const contextValue = {
    userInfo,
    loading,
    error,
    loadUserInfo,
    updateUserInfo,
    clearUserInfo,
    isAuthenticated: !!userInfo,
  };

  return (
    <InfoUserContext.Provider value={contextValue}>
      {children}
    </InfoUserContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useInfoUser() {
  const context = useContext(InfoUserContext);
  
  if (!context) {
    throw new Error('useInfoUser doit être utilisé à l\'intérieur d\'un InfoUserProvider');
  }
  return context;
}

// Validation des props
InfoUserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};