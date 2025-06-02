import axios from 'axios';

const API_URL = "http://localhost:5001/auth";

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
    const response = await axios.post(`${API_URL}/signup`, userData);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
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

// Connexion d'un utilisateur
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      
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
    const response = await axios.get('http://localhost:5001/exam/exams/user', getAuthHeader());
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
  localStorage.removeItem('token');
  localStorage.removeItem('user_info');
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