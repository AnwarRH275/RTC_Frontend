import axios from 'axios';
import authService from './authService';

// S'assurer que l'URL de base de l'API est toujours définie et se termine par un slash

import { API_BASE_URL } from './config';
//let API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.expressiontcf.com';




class SynthesisService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: `${API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`}synthesis`,
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
          window.location.href = '/connexion-tcf';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Convertit un texte en audio
   * @param {string} text - Le texte à convertir
   * @returns {Promise<Object>} - Objet contenant l'URL de l'audio et le nom du fichier
   */
  async synthesizeText(text, sessionId = null) {
    try {
      // Vérification si le texte est vide ou non défini
      if (!text || text.trim() === '') {
        console.warn('Tentative de synthèse avec un texte vide');
        return { filename: null, audioUrl: null };
      }
      
      // console.log(`Envoi de la requête de synthèse pour: "${text.substring(0, 30)}..."`);
      const payload = { text };
      if (sessionId) {
        payload.session_id = sessionId;
      }
      const response = await this.apiClient.post('/synthesize', payload);
      
      // Vérification si la réponse contient les données nécessaires
      if (!response.data) {
        console.warn('Réponse de synthèse vide');
        return { filename: null, audioUrl: null };
      }
      
      // Extraire les données de la réponse
      const { filename, audioUrl } = response.data;
      // console.log(`Réponse de synthèse reçue: filename=${filename}, audioUrl=${audioUrl}`);
      
      // Si nous avons un filename mais pas d'audioUrl, générer l'URL
      if (filename && !audioUrl) {
        const generatedUrl = this.getAudioUrl(filename);
        return { filename, audioUrl: generatedUrl };
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la synthèse vocale:', error);
      // Retourner un objet avec des valeurs nulles au lieu de null
      return { filename: null, audioUrl: null };
    }
  }

  /**
   * Récupère l'URL d'un fichier audio à partir de son nom
   * @param {string} filename - Le nom du fichier audio
   * @returns {string|null} - L'URL du fichier audio ou null si le nom de fichier est invalide
   */
  getAudioUrl(filename) {
    // Vérification si le nom de fichier est valide
    if (!filename || filename.trim() === '') {
      console.warn('Tentative de récupération d\'URL avec un nom de fichier vide');
      return null;
    }
    
    try {
      // S'assurer que API_BASE_URL est défini

      
      // S'assurer que API_BASE_URL se termine par un slash
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
      
      // Construire l'URL complète en utilisant le chemin correct du backend
      const url = `${baseUrl}synthesis/audio_responses/${filename}`;
      
      // Vérifier que l'URL construite est valide
      new URL(url); // Ceci lancera une erreur si l'URL est invalide
      
      // console.log(`URL audio créée avec succès: ${url}`);
      return url;
    } catch (error) {
      console.error('Erreur lors de la création de l\'URL audio:', error, 'filename:', filename);
      return null;
    }
  }

  /**
   * Vérifie si un fichier audio existe
   * @param {string} filename - Le nom du fichier audio
   * @returns {Promise<boolean>} - True si le fichier existe
   */
  async checkAudioExists(filename) {
    try {
      const response = await fetch(this.getAudioUrl(filename), {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Prépare le texte pour la synthèse vocale en combinant titre et objectif
   * @param {string} title - Le titre du sujet
   * @param {string} objective - L'objectif du sujet
   * @returns {string} - Le texte formaté pour la synthèse
   */
  formatTextForSynthesis(title, objective) {
    return `${title}. ${objective}`;
  }
}

export default new SynthesisService();