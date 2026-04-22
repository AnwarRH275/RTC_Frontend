import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/auth`;

// Configuration des en-têtes avec le token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Inscription d'un nouvel utilisateur
const signup = async (userData) => {
  try {
    // Pour l'inscription publique, ne pas envoyer de token d'autorisation
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await axios.post(`${API_URL}/signup`, userData, { headers });
    // Ne pas écraser le token existant si un staff est déjà connecté (création de compte pour un autre utilisateur)
    if (response.data.access_token && !token) {
      localStorage.setItem('token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response;
  } catch (error) {
    // Renvoyer un message unique pour toutes les erreurs d'authentification
    if (error.response) {
      const status = error.response.status;
      // Pour toutes les erreurs liées à l'authentification, afficher un message générique
      if ([400, 401, 403, 404].includes(status)) {
        throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
      }
      const dataMessage = error.response.data && error.response.data.message;
      if (dataMessage) {
        throw new Error(dataMessage);
      }
    }

    throw new Error("Nom d'utilisateur ou mot de passe incorrect.");
  }
};

// Connexion d'un utilisateur
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      // Stocker les informations utilisateur si disponibles
      if (response.data.user_info) {
        console.log('User info received from backend:', response.data.user_info); // Added console.log
        localStorage.setItem('user_info', JSON.stringify(response.data.user_info));
      }
    }
    return response;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Échec de la connexion. Veuillez vérifier vos identifiants.');
    }
  }
};

// Récupération des informations de l'utilisateur connecté
const getCurrentUser = async (forceRefresh = false) => {
  try {
    // Si forceRefresh est true ou si on n'a pas d'infos en cache, faire une requête API
    if (forceRefresh) {
      const response = await axios.get(`${API_URL}/me`, getAuthHeader());
      if (response.data) {
        localStorage.setItem('user_info', JSON.stringify(response.data));
        return response.data;
      }
    }
    
    // Essayer d'abord de récupérer depuis le localStorage
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      return JSON.parse(storedUserInfo);
    }
    
    // Si non disponible, faire une requête API
    const response = await axios.get(`${API_URL}/me`, getAuthHeader());
    if (response.data) {
      localStorage.setItem('user_info', JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    return null;
  }
};

// Récupération du profil utilisateur
const getCurrentUserPlan = async () => {
  try {
    const response = await axios.get(`${API_URL}/MyPlan`, getAuthHeader());
    return response.data.subscription_plan;
  } catch (error) {
    console.error('Erreur lors de la récupération du plan utilisateur:', error);
    return null;
  }
};

// Récupération des examens passés par l'utilisateur
const getUserExams = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exam/exams/user`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des examens utilisateur:', error);
    return [];
  }
};

// Récupération de tous les utilisateurs
const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// Mise à jour d'un utilisateur
const updateUser = async (userData) => {
  try {
    const response = await axios.put(`${API_URL}/signup`, userData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// Suppression d'un utilisateur
const deleteUser = async (username) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${username}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// Mise à jour du solde d'un utilisateur
const updateSold = async (username, newSoldValue) => {
  try {
    const response = await axios.put(`${API_URL}/update-sold`, {
      username: username,
      new_sold_value: newSoldValue
    }, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du solde:', error);
    throw error;
  }
};

// Déconnexion de l'utilisateur
const logout = () => {
  // Nettoyer complètement le localStorage
  localStorage.clear();
  
  // Nettoyer les cookies si ils existent
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  // Nettoyer le sessionStorage aussi
  sessionStorage.clear();
};

export default {
  signup,
  login,
  getCurrentUser,
  getCurrentUserPlan,
  getUserExams,
  getAllUsers,
  updateUser,
  deleteUser,
  updateSold,
  logout,
  getAuthHeader
};