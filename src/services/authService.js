import axios from 'axios';

const API_URL = "http://localhost:5001/auth";

// Configuration des en-têtes avec le token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log(token); // Ajout de cette ligne pour afficher le token dans la console des devtool
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
    throw error;
  }
};

// Connexion d'un utilisateur
const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response;
  } catch (error) {
    throw error;
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

// Déconnexion de l'utilisateur
const logout = () => {
  localStorage.removeItem('token');
};

export default {
  signup,
  login,
  getCurrentUserPlan,
  logout,
  getAuthHeader
};