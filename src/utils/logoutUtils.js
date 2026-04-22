/**
 * Utilitaire centralisé pour gérer la déconnexion complète
 * Nettoie tous les états, contextes, localStorage, sessionStorage et cookies
 */

import authService from '../services/authService';

/**
 * Fonction de déconnexion complète
 * @param {Function} clearUserInfo - Fonction pour nettoyer le contexte utilisateur
 * @param {Function} navigate - Fonction de navigation React Router
 * @param {boolean} forceReload - Forcer le rechargement de la page (par défaut: true)
 */
export const performCompleteLogout = (clearUserInfo, navigate, forceReload = true) => {
  try {
    // 1. Nettoyer le contexte utilisateur
    if (clearUserInfo && typeof clearUserInfo === 'function') {
      clearUserInfo();
    }
    
    // 2. Nettoyer le service d'authentification (localStorage, cookies, sessionStorage)
    authService.logout();
    
    // 3. Rediriger vers la page de connexion
    if (navigate && typeof navigate === 'function') {
      navigate('/connexion-tcf');
    }
    
    // 4. Forcer le rechargement de la page pour nettoyer tous les états résiduels
    if (forceReload) {
      // Utiliser setTimeout pour s'assurer que la navigation s'effectue avant le reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // En cas d'erreur, forcer quand même le rechargement
    window.location.href = '/connexion-tcf';
  }
};

/**
 * Fonction pour nettoyer manuellement tous les stockages
 * Utile en cas de problème de session
 */
export const clearAllStorage = () => {
  try {
    // Nettoyer localStorage
    localStorage.clear();
    
    // Nettoyer sessionStorage
    sessionStorage.clear();
    
    // Nettoyer tous les cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // console.log('Tous les stockages ont été nettoyés');
  } catch (error) {
    console.error('Erreur lors du nettoyage des stockages:', error);
  }
};

export default {
  performCompleteLogout,
  clearAllStorage
};