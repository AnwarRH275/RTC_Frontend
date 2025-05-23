import axios from "axios";

const API_URL = "http://localhost:5001/tcf";

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
        plans: subject.subscription_plan, // Convertir subscription_plan en plans pour le frontend
        tasks: subject.tasks.map(task => ({
          ...task,
          structure: task.description || task.structure || "",
          minWordCount: task.min_word_count || 0,
          wordCount: task.word_count || 0
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
      return response.data;
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
        subscription_plan: subjectData.plans, // Convertir plans en subscription_plan pour le backend
        subject_type: 'Écrit', // Toujours définir le type comme 'Écrit'
        tasks: subjectData.tasks.map(task => ({
          title: task.title,
          description: task.structure,
          word_count: task.wordCount,
          audio_duration: task.duration,
          min_word_count: task.minWordCount,
          instructions: task.instructions, // Ajouter le champ instructions
          documents_de_reference: task.documentsDeReference // Ajouter le champ documents_de_reference
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
        subscription_plan: subjectData.plans, // Convertir plans en subscription_plan pour le backend
        subject_type: 'Écrit', // Toujours définir le type comme 'Écrit'
        tasks: subjectData.tasks.map(task => ({
          title: task.title,
          description: task.structure,
          word_count: task.wordCount,
          audio_duration: task.duration,
          min_word_count: task.minWordCount,
          instructions: task.instructions // Ajouter le champ instructions
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