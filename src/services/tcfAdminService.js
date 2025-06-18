import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/tcf`;

/**
 * Service pour gérer les sujets TCF dans l'interface d'administration
 */
const TCFAdminService = {
  /**
   * Récupère tous les sujets TCF
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse contenant les sujets
   */
  getAllSubjects: async (type = null) => {
    try {
      const url = type ? `${API_URL}/subjects?type=${type}` : `${API_URL}/subjects`;
      const response = await axios.get(url);
      
      // Adapter les données du backend au format attendu par le frontend
      const adaptedData = response.data.map(subject => ({
        ...subject,
        blog: subject.description || "", // Convertir description en blog pour le frontend
        tasks: subject.tasks.map(task => ({
          ...task,
          structure: task.structure || "",
          instructions: task.instructions || "",
          minWordCount: task.min_word_count !== null ? task.min_word_count : 60,
          wordCount: task.max_word_count !== null ? task.max_word_count : 150,
          duration: task.duration !== null && task.duration !== undefined ? task.duration : null,
          documents: task.documents || []
        }))
      }));
      
      return adaptedData;
    } catch (error) {
      console.error("Erreur lors de la récupération des sujets TCF:", error);
      throw error;
    }
  },

  /**
   * Récupère un sujet TCF par son ID
   * @param {number} id - ID du sujet
   * @returns {Promise} - Promesse contenant le sujet
   */
  getSubjectById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/subjects/${id}`);
      // Adapter les données du backend au format attendu par le frontend
      const adaptedData = {
        ...response.data,
        blog: response.data.description || "", // Convertir description en blog pour le frontend
        tasks: response.data.tasks.map(task => ({
          ...task,
          structure: task.structure || "",
          instructions: task.instructions || "",
          minWordCount: task.min_word_count !== null ? task.min_word_count : 60,
          wordCount: task.max_word_count !== null ? task.max_word_count : 150,
          duration: task.duration !== null && task.duration !== undefined ? task.duration : null,
          documents: task.documents || []
        }))
      };
      return adaptedData;
    } catch (error) {
      console.error(`Erreur lors de la récupération du sujet TCF ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau sujet TCF
   * @param {Object} subjectData - Données du sujet
   * @returns {Promise} - Promesse contenant le sujet créé
   */
  createSubject: async (subjectData) => {
    try {
      // Adapter les données du frontend au format attendu par le backend
      const adaptedData = {
        ...subjectData,
        description: subjectData.blog || "", // Convertir blog en description pour le backend
        subject_type: 'Écrit', // Toujours définir le type comme 'Écrit'
        tasks: subjectData.tasks.map(task => ({
          id: task.id, // Inclure l'ID pour permettre la mise à jour intelligente
          title: task.title,
          structure: task.structure,
          instructions: task.instructions || "",
          min_word_count: task.minWordCount !== null && task.minWordCount !== undefined ? task.minWordCount : 0,
          max_word_count: task.wordCount !== null && task.wordCount !== undefined ? task.wordCount : 0,
          duration: task.duration !== null && task.duration !== undefined ? task.duration : null,
          documents: task.documents || []
        }))
      };

      const response = await axios.post(`${API_URL}/subjects`, adaptedData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du sujet TCF:", error);
      throw error;
    }
  },

  /**
   * Met à jour un sujet TCF existant
   * @param {number} id - ID du sujet
   * @param {Object} subjectData - Données du sujet
   * @returns {Promise} - Promesse contenant le sujet mis à jour
   */
  updateSubject: async (id, subjectData) => {
    try {
      // Adapter les données du frontend au format attendu par le backend
      const adaptedData = {
        ...subjectData,
        description: subjectData.blog || "", // Convertir blog en description pour le backend
        subject_type: 'Écrit', // Toujours définir le type comme 'Écrit'
        tasks: subjectData.tasks.map(task => ({
          id: task.id, // Inclure l'ID pour permettre la mise à jour intelligente
          title: task.title,
          structure: task.structure,
          instructions: task.instructions || "",
          min_word_count: task.minWordCount !== null && task.minWordCount !== undefined ? task.minWordCount : 0,
          max_word_count: task.wordCount !== null && task.wordCount !== undefined ? task.wordCount : 0,
          duration: task.duration !== null && task.duration !== undefined ? task.duration : null,
          documents: task.documents || []
        }))
      };

      const response = await axios.put(`${API_URL}/subjects/${id}`, adaptedData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du sujet TCF ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un sujet TCF
   * @param {number} id - ID du sujet
   * @returns {Promise} - Promesse contenant le message de confirmation
   */
  deleteSubject: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du sujet TCF ${id}:`, error);
      throw error;
    }
  },
};

export default TCFAdminService;