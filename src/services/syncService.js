import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/sync`;

// Configuration des en-têtes avec le token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Synchroniser les usages de tous les utilisateurs
const syncAllUserUsages = async () => {
  try {
    const response = await axios.post(`${API_URL}/sync-user-usages`, {}, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la synchronisation des usages:', error);
    throw error;
  }
};

// Synchroniser les usages d'un utilisateur spécifique
const syncUserUsage = async (username) => {
  try {
    const response = await axios.post(`${API_URL}/sync-user-usage/${username}`, {}, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation des usages pour ${username}:`, error);
    throw error;
  }
};

export default {
  syncAllUserUsages,
  syncUserUsage
};