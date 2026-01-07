import axios from 'axios';
import authService from './authService';
import { v4 as uuidv4 } from 'uuid';

import { API_BASE_URL } from './config';

class Task2AgentService {
  constructor() {
    this.sessionId = null; // Initialisation lazy
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL}/proxy-task2`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // Timeout de 60 secondes pour les requêtes longues
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
          window.location.href = '/connexion-tcf';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Génère un nouvel ID de session et le stocke
   * @returns {string} - L'ID de session généré
   */
  generateSessionId() {
    const sessionId = uuidv4();
    localStorage.setItem('task2_session_id', sessionId);
    this.sessionId = sessionId;
    return sessionId;
  }

  /**
   * Récupère l'ID de session actuel (initialisation lazy)
   * @returns {string} - L'ID de session
   */
  getSessionId() {
    if (!this.sessionId) {
      // Essayer de récupérer depuis localStorage
      const storedSessionId = localStorage.getItem('task2_session_id');
      if (storedSessionId) {
        this.sessionId = storedSessionId;
      } else {
        // Générer un nouveau sessionId si aucun n'existe
        this.sessionId = this.generateSessionId();
      }
    }
    return this.sessionId;
  }

  /**
   * Réinitialise l'ID de session (à utiliser au début d'un nouvel examen)
   */
  resetSessionId() {
    // Supprimer l'ancien sessionId du localStorage
    localStorage.removeItem('task2_session_id');
    this.sessionId = this.generateSessionId();
    console.log('[Task2AgentService] Session réinitialisée:', this.sessionId);
    return this.sessionId;
  }

  /**
   * Normalise l'URL audio pour s'assurer qu'elle est complète
   * @param {string} audioUrl - L'URL audio retournée par l'API
   * @returns {string} - L'URL audio normalisée
   */
  normalizeAudioUrl(audioUrl) {
    if (!audioUrl) return '';

    // Si l'URL est déjà complète, la retourner telle quelle
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return audioUrl;
    }

    // Si l'URL est relative, la préfixer avec l'URL de base de l'API
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return `${baseUrl}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
  }

  /**
   * Envoie un message à l'agent IA et récupère sa réponse
   * @param {string} message - Le message transcrit de l'utilisateur
   * @param {string} objectif - L'objectif de la tâche (optionnel)
   * @returns {Promise<Object>} - Objet contenant la réponse texte et audio de l'agent
   */
  async sendMessage(message, objectif = null) {
    try {
      // S'assurer que le sessionId est initialisé
      const currentSessionId = this.getSessionId();

      console.log('[Task2AgentService] Envoi du message avec sessionId:', currentSessionId);
      const payload = {
        chatInput: message,
        sessionId: currentSessionId
      };

      // Ajouter l'objectif s'il est fourni
      if (objectif) {
        payload.objectif = objectif;
      }

      const response = await this.apiClient.post('/agent-vocal', payload);

      const data = response.data;
      console.log('[Task2AgentService] Réponse brute de l\'API:', data);

      // Extraire et normaliser l'URL audio
      const rawAudioUrl = data.audio_url || data.audioUrl || '';
      const normalizedAudioUrl = this.normalizeAudioUrl(rawAudioUrl);

      // Normaliser la réponse pour le frontend
      return {
        text: data.output || data.text || '',
        audioUrl: normalizedAudioUrl,
        // Conserver les données brutes pour le débogage
        rawResponse: data
      };
    } catch (error) {
      console.error('[Task2AgentService] Erreur lors de la communication avec l\'agent IA:', error);
      console.error('[Task2AgentService] Détails de l\'erreur:', error.response?.data || error.message);

      // Fournir un message d'erreur plus descriptif selon le type d'erreur
      let errorMessage = 'Erreur lors de la communication avec l\'agent IA';

      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
      } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        errorMessage = 'Erreur de connexion réseau. Vérifiez votre connexion internet.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erreur serveur. L\'équipe technique a été notifiée.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  }
}

export default new Task2AgentService();