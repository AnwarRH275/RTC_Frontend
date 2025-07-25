/**
=========================================================
* Réussir TCF Canada - v2.0.0
* Service pour la gestion des sujets oraux TCF
=========================================================
*/

import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * Récupère tous les sujets oraux
 * @param {Object} params - Paramètres de filtrage et pagination
 * @returns {Promise} - Promesse contenant les sujets oraux
 */
export const getAllSubjects = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tcf-oral/oral-subjects`, { params });
    const data = response.data;
    
    // Si la réponse contient un tableau de sujets, adapter chaque sujet
    if (data.subjects && Array.isArray(data.subjects)) {
      return {
        ...data,
        subjects: data.subjects.map(subject => adaptBackendDataForForm(subject))
      };
    }
    
    // Si la réponse est directement un tableau de sujets
    if (Array.isArray(data)) {
      return data.map(subject => adaptBackendDataForForm(subject));
    }
    
    // Sinon, retourner les données telles quelles
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sujets oraux:', error);
    throw error;
  }
};

/**
 * Récupère un sujet oral par son ID
 * @param {number} id - ID du sujet oral
 * @returns {Promise} - Promesse contenant le sujet oral
 */
export const getSubjectById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tcf-oral/oral-subjects/${id}`);
    return adaptBackendDataForForm(response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération du sujet oral ${id}:`, error);
    throw error;
  }
};

/**
 * Adapte les données du formulaire frontend pour le backend
 * @param {Object} formData - Données du formulaire
 * @returns {Object} - Données adaptées pour le backend
 */
const adaptFormDataForBackend = (formData) => {
  // Adaptation des tâches
  const tasks = formData.tasks.map(task => ({
    title: task.title,
    task_type: task.taskType,
    objective: task.objective,
    trigger: task.trigger,
    evaluation_criteria: task.evaluationCriteria,
    duration: task.duration,
    points: task.points,
    preparation_time: task.preparationTime,
    roleplay_scenario: task.roleplayScenario
  }));

  // Adaptation du sujet
  return {
    name: formData.name,
    description: formData.description,
    date: formData.date,
    status: formData.status,
    duration: formData.duration,
    subject_type: 'Oral',
    combination: formData.combination,
    tasks: tasks
  };
};

/**
 * Adapte les données du backend pour le frontend
 * @param {Object} backendData - Données du backend
 * @returns {Object} - Données adaptées pour le frontend
 */
const adaptBackendDataForForm = (backendData) => {
  // Adaptation des tâches
  const tasks = backendData.tasks.map(task => ({
    id: task.id,
    title: task.title,
    taskType: task.task_type,
    objective: task.objective,
    trigger: task.trigger,
    evaluationCriteria: task.evaluation_criteria,
    duration: task.duration,
    points: task.points,
    preparationTime: task.preparation_time,
    roleplayScenario: task.roleplay_scenario
  }));

  // Adaptation du sujet
  return {
    id: backendData.id,
    name: backendData.name,
    description: backendData.description,
    blog: backendData.description || '', // Map description to blog for UI compatibility
    date: backendData.date,
    status: backendData.status,
    duration: backendData.duration,
    subjectType: backendData.subject_type,
    combination: backendData.combination,
    tasks: tasks
  };
};

/**
 * Crée un nouveau sujet oral
 * @param {Object} formData - Données du formulaire
 * @returns {Promise} - Promesse contenant le sujet oral créé
 */
export const createSubject = async (formData) => {
  try {
    const adaptedData = adaptFormDataForBackend(formData);
    const response = await axios.post(`${API_BASE_URL}/tcf-oral/oral-subjects`, adaptedData);
    return adaptBackendDataForForm(response.data);
  } catch (error) {
    console.error('Erreur lors de la création du sujet oral:', error);
    throw error;
  }
};

/**
 * Met à jour un sujet oral existant
 * @param {number} id - ID du sujet oral
 * @param {Object} formData - Données du formulaire
 * @returns {Promise} - Promesse contenant le sujet oral mis à jour
 */
export const updateSubject = async (id, formData) => {
  try {
    const adaptedData = adaptFormDataForBackend(formData);
    const response = await axios.put(`${API_BASE_URL}/tcf-oral/oral-subjects/${id}`, adaptedData);
    return adaptBackendDataForForm(response.data);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du sujet oral ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un sujet oral
 * @param {number} id - ID du sujet oral
 * @returns {Promise} - Promesse contenant le résultat de la suppression
 */
export const deleteSubject = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/tcf-oral/oral-subjects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression du sujet oral ${id}:`, error);
    throw error;
  }
};

/**
 * Récupère tous les types de tâches orales disponibles
 * @returns {Promise} - Promesse contenant les types de tâches orales
 */
export const getOralTaskTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tcf-oral/oral-task-types`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des types de tâches orales:', error);
    throw error;
  }
};

// Création d'un objet service pour l'export par défaut
const TCFOralService = {
  // Méthodes principales
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  
  // Méthodes pour les métadonnées
  getTaskTypes: getOralTaskTypes,
  
  // Méthodes supplémentaires pour la compatibilité avec tcfAdminService
  getQuestionCategories: async () => {
    // Cette fonctionnalité n'est pas implémentée dans le backend pour l'oral
    // Retourne un tableau vide par défaut
    console.warn('getQuestionCategories n\'est pas implémenté pour les sujets oraux');
    return [];
  },
  
  getDifficultyLevels: async () => {
    // Cette fonctionnalité n'est pas implémentée dans le backend pour l'oral
    // Retourne un tableau vide par défaut
    console.warn('getDifficultyLevels n\'est pas implémenté pour les sujets oraux');
    return [];
  }
};

export default TCFOralService;