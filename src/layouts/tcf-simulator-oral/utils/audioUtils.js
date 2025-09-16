import synthesisService from 'services/synthesisService';

export const generateAudio = async (text, subjectId) => {
  try {
    // Récupérer les informations utilisateur depuis localStorage
    let processedText = text;
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        const prenom = userInfo.prenom || '';
        
        // Remplacer "Bonjour" par "Bonjour {prenom}" si un prénom existe
        if (prenom && text.includes('NomCandidat')) {
          processedText = text.replace(/NomCandidat/g, `${prenom}`);
        }
      }
    } catch (localStorageError) {
      console.warn('Erreur lors de la récupération du prénom depuis localStorage:', localStorageError);
      // Continuer avec le texte original si erreur
    } 
    
    const audioResult = await synthesisService.synthesizeText(processedText, subjectId);
    if (audioResult && (audioResult.audioUrl || audioResult.filename)) {
      return audioResult.audioUrl || synthesisService.getAudioUrl(audioResult.filename);
    }
  } catch (error) {
    console.warn(`Erreur de génération audio:`, error);
  }
  return null;
};