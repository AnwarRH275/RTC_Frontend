import axios from 'axios';
import { API_BASE_URL } from './config';

const API_URL = `${API_BASE_URL}/tcf`;

/**
 * Service pour gérer les sujets TCF Écrits dans l'interface d'administration
 */
const TCFWrittenService = {
  /**
   * Récupère tous les sujets TCF écrits
   * @returns {Promise} - Promesse contenant les sujets écrits
   */
  getAllSubjects: async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects?type=Écrit`);
      
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
      console.error("Erreur lors de la récupération des sujets TCF écrits:", error);
      throw error;
    }
  },

  /**
   * Récupère un sujet TCF écrit par son ID
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
      console.error(`Erreur lors de la récupération du sujet TCF écrit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau sujet TCF écrit
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
      console.error("Erreur lors de la création du sujet TCF écrit:", error);
      throw error;
    }
  },

  /**
   * Met à jour un sujet TCF écrit existant
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
      console.error(`Erreur lors de la mise à jour du sujet TCF écrit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un sujet TCF écrit
   * @param {number} id - ID du sujet
   * @returns {Promise} - Promesse contenant le message de confirmation
   */
  deleteSubject: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du sujet TCF écrit ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle tâche pour un sujet écrit
   * @param {number} subjectId - ID du sujet
   * @param {Object} taskData - Données de la tâche
   * @returns {Promise} - Promesse contenant la tâche créée
   */
  createTask: async (subjectId, taskData) => {
    try {
      const adaptedData = {
        title: taskData.title,
        structure: taskData.structure || "",
        instructions: taskData.instructions || "",
        min_word_count: taskData.minWordCount || 0,
        max_word_count: taskData.wordCount || 0,
        duration: taskData.duration || null,
        documents: taskData.documents || []
      };
      
      const response = await axios.post(`${API_URL}/subjects/${subjectId}/tasks`, adaptedData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la tâche écrite:", error);
      throw error;
    }
  },

  /**
   * Met à jour une tâche écrite existante
   * @param {number} subjectId - ID du sujet
   * @param {number} taskId - ID de la tâche
   * @param {Object} taskData - Données de la tâche
   * @returns {Promise} - Promesse contenant la tâche mise à jour
   */
  updateTask: async (subjectId, taskId, taskData) => {
    try {
      const adaptedData = {
        title: taskData.title,
        structure: taskData.structure || "",
        instructions: taskData.instructions || "",
        min_word_count: taskData.minWordCount || 0,
        max_word_count: taskData.wordCount || 0,
        duration: taskData.duration || null,
        documents: taskData.documents || []
      };
      
      const response = await axios.put(`${API_URL}/subjects/${subjectId}/tasks/${taskId}`, adaptedData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche écrite:", error);
      throw error;
    }
  },

  /**
   * Supprime une tâche écrite
   * @param {number} subjectId - ID du sujet
   * @param {number} taskId - ID de la tâche
   * @returns {Promise} - Promesse contenant le message de confirmation
   */
  deleteTask: async (subjectId, taskId) => {
    try {
      const response = await axios.delete(`${API_URL}/subjects/${subjectId}/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression de la tâche écrite:", error);
      throw error;
    }
  },

  /**
   * Ajoute un document à une tâche
   * @param {number} taskId - ID de la tâche
   * @param {Object} documentData - Données du document
   * @returns {Promise} - Promesse contenant le document créé
   */
  addDocument: async (taskId, documentData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks/${taskId}/documents`, documentData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du document:", error);
      throw error;
    }
  },

  /**
   * Met à jour un document
   * @param {number} documentId - ID du document
   * @param {Object} documentData - Données du document
   * @returns {Promise} - Promesse contenant le document mis à jour
   */
  updateDocument: async (documentId, documentData) => {
    try {
      const response = await axios.put(`${API_URL}/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document:", error);
      throw error;
    }
  },

  /**
   * Supprime un document
   * @param {number} documentId - ID du document
   * @returns {Promise} - Promesse contenant le message de confirmation
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await axios.delete(`${API_URL}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression du document:", error);
      throw error;
    }
  }
};

export default TCFWrittenService;