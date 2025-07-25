/**
=========================================================
* Réussir TCF Canada - v2.0.0
* Service pour la validation de l'agent
=========================================================
*/

import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * Valide si l'utilisateur est prêt à commencer l'examen
 * @param {string} transcript - Transcription à valider
 * @returns {Promise} - Promesse contenant le résultat de la validation
 */
export const validateReadiness = async (transcript) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/tcf-oral/agent-validation`, { transcript });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la validation de la transcription:', error);
    throw error;
  }
};

// Création d'un objet service pour l'export par défaut
const AgentValidationService = {
  validateReadiness
};

export default AgentValidationService;