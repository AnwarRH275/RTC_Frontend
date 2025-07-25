import TCFWrittenService from './tcfWrittenService';
import TCFOralService from './tcfOralService';

/**
 * Service unifié pour gérer les sujets TCF dans l'interface d'administration
 * Ce service sert de façade pour les services spécialisés (écrit et oral)
 */
const TCFAdminService = {
  /**
   * Récupère tous les sujets TCF
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse contenant les sujets
   */
  getAllSubjects: async (type = null) => {
    try {
      if (type === 'Oral') {
        const response = await TCFOralService.getAllSubjects();
        return response.subjects || [];
      } else if (type === 'Écrit') {
        return await TCFWrittenService.getAllSubjects();
      } else {
        // Si aucun type spécifié, récupérer les deux types
        const [writtenSubjects, oralResponse] = await Promise.all([
          TCFWrittenService.getAllSubjects(),
          TCFOralService.getAllSubjects()
        ]);
        const oralSubjects = oralResponse.subjects || [];
        return [...writtenSubjects, ...oralSubjects];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des sujets TCF:", error);
      throw error;
    }
  },

  /**
   * Récupère un sujet TCF par son ID
   * @param {number} id - ID du sujet
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse contenant le sujet
   */
  getSubjectById: async (id, type = 'Écrit') => {
    try {
      if (type === 'Oral') {
        return await TCFOralService.getSubjectById(id);
      } else {
        return await TCFWrittenService.getSubjectById(id);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du sujet TCF ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée un nouveau sujet TCF
   * @param {Object} subjectData - Données du sujet
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse contenant le sujet créé
   */
  createSubject: async (subjectData, type = 'Écrit') => {
    try {
      if (type === 'Oral') {
        return await TCFOralService.createSubject(subjectData);
      } else {
        return await TCFWrittenService.createSubject(subjectData);
      }
    } catch (error) {
      console.error("Erreur lors de la création du sujet TCF:", error);
      throw error;
    }
  },

  /**
   * Met à jour un sujet TCF existant
   * @param {number} id - ID du sujet
   * @param {Object} subjectData - Données du sujet
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse contenant le sujet mis à jour
   */
  updateSubject: async (id, subjectData, type = 'Écrit') => {
    try {
      if (type === 'Oral') {
        return await TCFOralService.updateSubject(id, subjectData);
      } else {
        return await TCFWrittenService.updateSubject(id, subjectData);
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du sujet TCF ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime un sujet TCF
   * @param {number} id - ID du sujet
   * @param {string} type - Type de sujet (Écrit, Oral)
   * @returns {Promise} - Promesse de suppression
   */
  deleteSubject: async (id, type = 'Écrit') => {
    try {
      if (type === 'Oral') {
        return await TCFOralService.deleteSubject(id);
      } else {
        return await TCFWrittenService.deleteSubject(id);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression du sujet TCF ${id}:`, error);
      throw error;
    }
  },

  // ===== MÉTHODES DÉLÉGUÉES AUX SERVICES SPÉCIALISÉS =====
  // Les méthodes ci-dessus délèguent maintenant aux services TCFWrittenService et TCFOralService
  // pour une meilleure séparation des responsabilités et une maintenance plus facile.

  // ===== MÉTHODES DE DÉLÉGATION POUR COMPATIBILITÉ =====
  // Ces méthodes maintiennent la compatibilité avec l'interface existante
  // tout en déléguant aux services spécialisés

  // Méthodes pour les métadonnées orales

  /**
   * Récupère les types de tâches orales disponibles (délégation)
   * @returns {Promise} - Promesse contenant les types de tâches
   */
  getOralTaskTypes: () => TCFOralService.getTaskTypes(),

  /**
   * Récupère les catégories de questions d'entretien (délégation)
   * @returns {Promise} - Promesse contenant les catégories
   */
  getInterviewCategories: () => TCFOralService.getQuestionCategories(),

  /**
   * Récupère les niveaux de difficulté disponibles (délégation)
   * @returns {Promise} - Promesse contenant les niveaux de difficulté
   */
  getDifficultyLevels: () => TCFOralService.getDifficultyLevels(),
};

export default TCFAdminService;