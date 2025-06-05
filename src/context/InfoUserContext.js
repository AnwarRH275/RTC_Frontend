import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import authService from '../services/authService';

// Création du contexte
const InfoUserContext = createContext();

// Provider du contexte
export function InfoUserProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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