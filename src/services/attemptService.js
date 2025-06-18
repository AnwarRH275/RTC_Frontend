import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/attempt`;

// Configuration des en-têtes avec le token JWT
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Vérifier si l'utilisateur peut passer l'examen (max 2 tentatives)
const checkAttempts = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/attempts/check/${subjectId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification des tentatives:', error);
    throw error;
  }
};

// Récupérer les tentatives pour un sujet spécifique
const getAttemptsBySubject = async (subjectId) => {
  try {
    const response = await axios.get(`${API_URL}/attempts/subject/${subjectId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des tentatives:', error);
    throw error;
  }
};

// Incrémenter le compteur de tentatives
const incrementAttempt = async (subjectId) => {
  try {
    const response = await axios.post(`${API_URL}/attempts/subject/${subjectId}`, {}, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation des tentatives:', error);
    throw error;
  }
};

// Récupérer toutes les tentatives de l'utilisateur
const getAllAttempts = async () => {
  try {
    const response = await axios.get(`${API_URL}/attempts`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de toutes les tentatives:', error);
    throw error;
  }
};

const attemptService = {
  checkAttempts,
  getAttemptsBySubject,
  incrementAttempt,
  getAllAttempts
};

export default attemptService;