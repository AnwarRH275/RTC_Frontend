import axios from 'axios';
import authService from './authService';
import { v4 as uuidv4 } from 'uuid';

//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.expressiontcf.com';
class Task2AgentService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/proxy-task2`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercepteur pour ajouter le token d'authentification
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Intercepteur pour gérer les erreurs de réponse
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          authService.logout();
          window.location.href = '/authentication/sign-in';
        }
        return Promise.reject(error);
      }
    );

    // Initialiser ou récupérer l'ID de session
    this.sessionId = localStorage.getItem('task2_session_id') || this.generateSessionId();
  }

  /**
   * Génère un nouvel ID de session et le stocke
   * @returns {string} - L'ID de session généré
   */
  generateSessionId() {
    const sessionId = uuidv4();
    localStorage.setItem('task2_session_id', sessionId);
    return sessionId;
  }

  /**
   * Récupère l'ID de session actuel
   * @returns {string} - L'ID de session
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Réinitialise l'ID de session (à utiliser au début d'un nouvel examen)
   */
  resetSessionId() {
    this.sessionId = this.generateSessionId();
    return this.sessionId;
  }

  /**
   * Envoie un message à l'agent IA et récupère sa réponse
   * @param {string} message - Le message transcrit de l'utilisateur
   * @param {string} objectif - L'objectif de la tâche (optionnel)
   * @returns {Promise<Object>} - Objet contenant la réponse texte et audio de l'agent
   */
  async sendMessage(message, objectif = null) {
    try {
      console.log('[Task2AgentService] Envoi du message avec sessionId:', this.sessionId);
      const payload = {
        chatInput: message,
        sessionId: this.sessionId
      };
      
      // Ajouter l'objectif s'il est fourni
      if (objectif) {
        payload.objectif = objectif;
      }
      
      const response = await this.apiClient.post('/agent-vocal', payload);
      
      const data = response.data;
      console.log('[Task2AgentService] Réponse brute de l\'API:', data);
      
      // Normaliser la réponse pour le frontend
      return {
        text: data.output || data.text || '',
        audioUrl: data.audio_url || data.audioUrl || '',
        // Conserver les données brutes pour le débogage
        rawResponse: data
      };
    } catch (error) {
      console.error('[Task2AgentService] Erreur lors de la communication avec l\'agent IA:', error);
      console.error('[Task2AgentService] Détails de l\'erreur:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.message ||
        'Erreur lors de la communication avec l\'agent IA'
      );
    }
  }
}

export default new Task2AgentService();