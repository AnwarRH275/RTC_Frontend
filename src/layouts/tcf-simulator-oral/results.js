import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../services/config";
import ReactMarkdown from "react-markdown";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Zoom from "@mui/material/Zoom";

import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { keyframes } from "@mui/system";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Services
import TCFAdminService from "services/tcfAdminService";
import authService from "services/authService";
import { Paper } from "@mui/material";
import tcfCanadaLogo from 'assets/logo-tfc-canada.png';

// Animations pour le logo de chargement
const breatheAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.08);
    opacity: 1;
  }
`;

const shimmerAnimation = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const rotateRing = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

// Container moderne pour le logo de chargement
const LogoLoader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  padding: '20px',
  
  '& .logo-container': {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 260,
    marginTop: 10,
    marginBottom: 30,
  },
  
  '& .logo-ring': {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: '50%',
    border: '4px solid transparent',
    borderTopColor: 'rgba(66, 153, 225, 0.9)',
    borderRightColor: 'rgba(49, 130, 206, 0.5)',
    animation: `${rotateRing} 2s linear infinite`,
    zIndex: 1,
  },
  
  '& .logo-ring-2': {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: '50%',
    border: '3px solid transparent',
    borderBottomColor: 'rgba(99, 179, 237, 0.7)',
    borderLeftColor: 'rgba(66, 153, 225, 0.4)',
    animation: `${rotateRing} 3s linear infinite reverse`,
    zIndex: 0,
  },
  
  '& .logo-image': {
    width: 150,
    height: 'auto',
    animation: `${breatheAnimation} 2.5s ease-in-out infinite`,
    filter: 'drop-shadow(0 12px 32px rgba(66, 153, 225, 0.35))',
    zIndex: 2,
    position: 'relative',
  },
  
  '@media (max-width: 600px)': {
    '& .logo-container': {
      width: 160,
      height: 160,
      marginTop: 8,
      marginBottom: 16,
    },
    '& .logo-ring': {
      width: 140,
      height: 140,
    },
    '& .logo-ring-2': {
      width: 170,
      height: 170,
    },
    '& .logo-image': {
      width: 100,
    },
  },  
  '& .loading-text': {
    marginBottom: 12,
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#1A365D',
    letterSpacing: '1px',
    textAlign: 'center',
  },
  
  '& .loading-subtext': {
    marginBottom: 20,
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#4A5568',
    background: 'linear-gradient(90deg, #4A5568 0%, #4299E1 50%, #4A5568 100%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: `${shimmerAnimation} 2s linear infinite`,
  },
  
  '& .dots': {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: 20,
    
    '& span': {
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: '#4299E1',
      animation: `${breatheAnimation} 1.4s ease-in-out infinite`,
      
      '&:nth-of-type(1)': { animationDelay: '0s' },
      '&:nth-of-type(2)': { animationDelay: '0.2s' },
      '&:nth-of-type(3)': { animationDelay: '0.4s' },
    }
  }
}));

function TCFResultsInterface() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  // États principaux
  const [subject, setSubject] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [noteMoyenne, setNoteMoyenne] = useState(null);
  const [loadingNoteMoyenne, setLoadingNoteMoyenne] = useState(false);
  
  // États pour la traduction
  const [translationOpen, setTranslationOpen] = useState(false);
  const [targetLang, setTargetLang] = useState("");
  const [translating, setTranslating] = useState(false);
  const [translatedResults, setTranslatedResults] = useState(null);
  const [translationError, setTranslationError] = useState(null);
  const [currentTaskToTranslate,setCurrentTaskToTranslate] = useState(null);
  
  // Liste des langues disponibles pour la traduction
  const availableLanguages = [
    { code: "DE", name: "Allemand" },
    { code: "EN", name: "Anglais" },
    { code: "AR", name: "Arabe" },
    { code: "ZH", name: "Chinois" },
    { code: "ES", name: "Espagnol" },
    { code: "FR", name: "Français" },
    { code: "HI", name: "Hindi" },
    { code: "IT", name: "Italien" },
    { code: "JA", name: "Japonais" },
    { code: "PT", name: "Portugais" },
    { code: "RU", name: "Russe" },
  ];

  // Fonction pour récupérer l'ID utilisateur depuis le token JWT
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      // Décoder le token JWT pour récupérer l'ID utilisateur
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || 0;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return 0;
    }
  };

  // Fonction pour enregistrer les résultats via l'API
  const saveResultsToAPI = async (correctionResults, subjectData, responsesData) => {
    try {
      setSaving(true);
      const userId = getUserIdFromToken();
      
      // Préparer les données pour chaque tâche en utilisant le nouveau format
      const savePromises = correctionResults
        .filter((taskResult) => taskResult && taskResult.output) // Ignorer les tâches vides
        .map(async (taskResult, _idx) => {
        const taskKey = Object.keys(taskResult.output)[0]; // tache1, tache2, etc.
        const taskData = taskResult.output[taskKey];
        // Retrouver l'index original à partir du nom de la tâche (tache1 → 0, tache2 → 1, etc.)
        const originalIndex = parseInt(taskKey.replace('tache', ''), 10) - 1;
        const task = subjectData.tasks[originalIndex] || subjectData.tasks[_idx];
        const taskResponse = responsesData[originalIndex] || '';
        
        const payload = {
          id_user: userId,
          id_subject: parseInt(subjectId),
          id_task: task?.id || originalIndex + 1,
          reponse_utilisateur: taskResponse,
          score: taskData.NoteExam || '',
          reponse_ia: taskData.corrections_taches?.[0] || '',
          points_fort: taskData.pointsForts?.join(', ') || '',
          point_faible: taskData.pointsAmeliorer?.join(', ') || '',
          traduction_reponse_ia: null,
          type_exam: 'oral'
        };
        
        return axios.post(`${API_BASE_URL}/exam/exams/user`, payload, {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            ...authService.getAuthHeader().headers
          }
        });
      });
      
      await Promise.all(savePromises);
      console.log('Résultats enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des résultats:', error);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour traduire les commentaires
  const translateFeedback = async () => {
    if (!targetLang) {
      setTranslationError("Veuillez sélectionner une langue cible");
      return;
    }
    
    if (currentTaskToTranslate === null) {
      setTranslationError("Aucune tâche sélectionnée pour la traduction");
      return;
    }
    
    setTranslating(true);
    setTranslationError(null);
    
    // Préparer les données pour la traduction de la tâche sélectionnée uniquement
    let taskPointsForts = [];
    let taskPointsAmeliorer = [];
    
    if (results && Array.isArray(results) && results[currentTaskToTranslate]) {
      const taskResult = results[currentTaskToTranslate];
      if (taskResult && taskResult.output) {
        const taskKey = Object.keys(taskResult.output)[0];
        const taskData = taskResult.output[taskKey];
        
        if (taskData?.pointsForts) taskPointsForts = taskData.pointsForts;
        if (taskData?.pointsAmeliorer) taskPointsAmeliorer = taskData.pointsAmeliorer;
      }
    }
    
    const payload = {
      pointsForts: taskPointsForts,
      pointsAmeliorer: taskPointsAmeliorer,
      targetLanguage: targetLang
    };
    
    // Fonction pour effectuer l'appel API de traduction avec retry
    const makeTranslationAPICall = async (retryCount = 0) => {
      try {
        // Appel réel à l'API de traduction
        const response = await axios.post(
          `${API_BASE_URL}/proxy-translation/translation`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        // Traiter la réponse de l'API avec la nouvelle structure
        if (response.data && response.data.output) {
          const translations = response.data.output;
          
          // Utiliser la nouvelle structure de réponse
          const pointsFortsTraduit = translations.pointsFortsTraduit || [];
          const pointsAmeliorerTraduit = translations.pointsAmeliorerTraduit || [];
          
          // Mettre à jour seulement la tâche sélectionnée dans les résultats
          if (results && Array.isArray(results) && results[currentTaskToTranslate]) {
            const updatedResults = [...results];
            const taskResult = updatedResults[currentTaskToTranslate];
            if (!taskResult || !taskResult.output) return;
            const taskKey = Object.keys(taskResult.output)[0];
            
            // Ajouter les traductions à la tâche
            updatedResults[currentTaskToTranslate] = {
              ...taskResult,
              output: {
                ...taskResult.output,
                [taskKey]: {
                  ...taskResult.output[taskKey],
                  pointsFortsTraduit: pointsFortsTraduit,
                  pointsAmeliorerTraduit: pointsAmeliorerTraduit
                }
              }
            };
            
            setResults(updatedResults);
          }
          
          setTranslationOpen(false);
          setTranslating(false);
        } else {
          throw new Error('Format de réponse de traduction invalide');
        }
      } catch (apiError) {
        console.error(`Tentative de traduction ${retryCount + 1} échouée:`, apiError);
        
        if (retryCount < 1) { // Un seul retry
          console.log(`Nouvelle tentative de traduction dans 2 secondes... (${retryCount + 2}/2)`);
          setTimeout(() => {
            makeTranslationAPICall(retryCount + 1);
          }, 2000); // Attendre 2 secondes avant de réessayer
        } else {
          console.error('Toutes les tentatives de traduction ont échoué');
          setTranslationError("Erreur lors de la traduction après 2 tentatives. Veuillez réessayer.");
          setTranslating(false);
        }
      }
    };
    
    await makeTranslationAPICall();
  };

  // Fonction pour fermer le modal de traduction
  const handleCloseTranslation = () => {
    setTranslationOpen(false);
    setTargetLang("");
    setTranslationError(null);
    setTranslatedResults(null);
    setCurrentTaskToTranslate(null);
  };

  // Fonction pour ouvrir le modal de traduction
  const handleOpenTranslation = (taskIndex) => {
    setCurrentTaskToTranslate(taskIndex);
    setTranslationOpen(true);
  };

  // useEffect principal pour charger les données et soumettre pour correction
  useEffect(() => {
    const fetchSubjectAndSubmit = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données du sujet depuis localStorage
        const storedSubjectData = localStorage.getItem(`exam_subject_${subjectId}`);
        let subjectData = null;
        
        if (storedSubjectData) {
          subjectData = JSON.parse(storedSubjectData);
          setSubject(subjectData);
          console.log('Données du sujet récupérées:', subjectData);
        } else {
          throw new Error('Données du sujet non trouvées dans localStorage');
        }
        
        // Vérifier si les conversations formatées sont disponibles
        for (let i = 0; i < 3; i++) { // Vérifier les 3 tâches
          const formattedKey = `formatted_conversation_task_${i + 1}`;
          const formattedConversation = localStorage.getItem(formattedKey);
          console.log(`Vérification de la conversation formatée pour la tâche ${i + 1}:`, formattedConversation || 'Non trouvée');
        }
        
        // Récupérer les réponses depuis localStorage
        const storedResponses = localStorage.getItem(`tcf-oral-responses-${subjectId}`);
        let responsesData = {};
        
        if (storedResponses) {
          responsesData = JSON.parse(storedResponses);
        }
        
        // Priorité 1: Récupérer les conversations formatées depuis localStorage
        for (let i = 0; i < subjectData.tasks.length; i++) {
          const formattedKey = `formatted_conversation_task_${i + 1}`;
          const formattedConversation = localStorage.getItem(formattedKey);
          
          if (formattedConversation) {
            // Utiliser directement la conversation formatée
            responsesData[i] = formattedConversation;
            console.log(`Conversation formatée récupérée pour la tâche ${i + 1}:`, formattedConversation);
          } else {
            // Priorité 2: Vérifier s'il y a des sessions complètes
            const sessionKey = `exam_session_${subjectId}_task_${i}_complete`;
            const sessionData = localStorage.getItem(sessionKey);
            
            if (sessionData && (!responsesData[i] || responsesData[i].trim() === '')) {
              try {
                const session = JSON.parse(sessionData);
                if (session.messages && Array.isArray(session.messages)) {
                  // Filtrer et formater les messages selon le format demandé
                  const conversationParts = [];
                  
                  session.messages.forEach(message => {
                    if (message.sender === 'user') {
                      conversationParts.push(`User:${message.content}`);
                    } else if (message.sender === 'examiner') {
                      conversationParts.push(`Agent:${message.content}`);
                    }
                  });
                  
                  responsesData[i] = conversationParts.join('\n');
                }
              } catch (e) {
                console.error('Erreur lors du parsing de la session:', e);
              }
            }
          }
        }
        
        // Mettre à jour le state avec toutes les données récupérées
        setResponses(responsesData);
        console.log('Données de réponses finales:', responsesData);
        
        // Préparer les données pour l'API de correction
        const chatInputArray = [];
        
        // Pour chaque tâche, récupérer les conversations formatées depuis localStorage
        for (let i = 0; i < subjectData.tasks.length; i++) {
          // Récupérer les conversations formatées au format tacheX:Examinateur:text Candidat:text
          const formattedKey = `formatted_conversation_task_${i + 1}`;
          const formattedConversation = localStorage.getItem(formattedKey);
          let taskConversation = '';
          
          if (formattedConversation) {
            // Utiliser directement la conversation formatée
            // Remplacer tacheX: par repenseTaskX: pour la compatibilité avec l'API
            taskConversation = formattedConversation.replace(`tache${i + 1}:`, `repenseTask${i + 1}:`);
            console.log(`Conversation formatée trouvée pour la tâche ${i + 1}:`, taskConversation);
          } else if (responsesData[i]) {
            // Fallback: utiliser les anciennes données si la conversation formatée n'existe pas
            console.log(`Aucune conversation formatée trouvée pour la tâche ${i + 1}, utilisation du format de secours`);
            const formattedResponse = responsesData[i].replace(/\n/g, ',');
            taskConversation = `repenseTask${i + 1}:${formattedResponse}`;
          } else {
            // Format par défaut si pas de réponse
            console.log(`Aucune donnée trouvée pour la tâche ${i + 1}, utilisation du format par défaut`);
            taskConversation = `repenseTask${i + 1}:Agent:textAgent,User:TextUser`;
          }
          
          chatInputArray.push(taskConversation);
        }
        
        const payload = {
          sessionId: `session-${Date.now()}`,
          chatInput: chatInputArray
        };
        
        // Helper: attendre N ms (utilisé entre les retries)
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // Fonction pour effectuer l'appel API avec retry (max 1 retry pour limiter la consommation de tokens)
        const makeAPICall = async (retryCount = 0) => {
          try {
            // Appel réel à l'API de correction ORAL
            const response = await axios.post(
              `${API_BASE_URL}/proxy/oral`,
              payload,
              {
                headers: { 'Content-Type': 'application/json' },
                timeout: 360000, // 6 minutes max côté navigateur (n8n peut prendre 5 min)
              }
            );
            
            // Traiter la réponse de l'API
            if (response.data && Array.isArray(response.data)) {
              setResults(response.data);
              
              // Calculer la note moyenne
              await calculateNoteMoyenne(response.data);
              
              // Enregistrer les résultats via l'API d'enregistrement, en passant subjectData
              await saveResultsToAPI(response.data, subjectData, responsesData);
              
              // Nettoyer les fichiers audio générés pour éviter d'épuiser les ressources
              try {
                const cleanupResp = await axios.post(
                  `${API_BASE_URL}/synthesis/cleanup-audio-files`,
                  { session_id: subjectId },
                  { headers: { 'Content-Type': 'application/json' } }
                );
                console.log('Nettoyage des fichiers audio:', cleanupResp.data);
              } catch (cleanupError) {
                console.warn('Erreur lors du nettoyage des fichiers audio via API:', cleanupError);
              }
              
              setLoading(false);
            } else {
              throw new Error('Format de réponse invalide');
            }
          } catch (apiError) {
            console.error(`Tentative ${retryCount + 1} échouée:`, apiError);
            
            if (retryCount < 1) { // 1 seul retry pour ne pas consommer les tokens inutilement
              console.log(`Nouvelle tentative dans 10 secondes... (${retryCount + 2}/2)`);
              await delay(10000); // 10 sec entre les tentatives
              return makeAPICall(retryCount + 1);
            } else {
              console.error('Toutes les tentatives ont échoué');
              setError("Une erreur s'est produite lors de la correction. Veuillez réessayer.");
              setLoading(false);
            }
          }
        };
        
        // Démarrer l'appel API avec retry
        await makeAPICall();
        
      } catch (error) {
        console.error('Erreur lors de la correction:', error);
        setError("Une erreur s'est produite lors de la correction. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchSubjectAndSubmit();
  }, [subjectId]);

  // Fonction pour calculer la note moyenne
  const calculateNoteMoyenne = async (resultsData) => {
    try {
      setLoadingNoteMoyenne(true);
      
      // Extraire les noteExam de chaque tâche
      const noteExams = {};
      
      if (resultsData && Array.isArray(resultsData)) {
        resultsData.forEach((taskResult, index) => {
          // Ignorer les tâches vides (pas de clé output)
          if (!taskResult || !taskResult.output) return;
          const taskKey = Object.keys(taskResult.output)[0];
          const taskData = taskResult.output[taskKey];
          const noteExam = taskData?.NoteExam || '';
          
          if (noteExam) {
            noteExams[`Tache${index + 1}`] = noteExam;
          }
        });
      }
      
      // Vérifier qu'on a au moins une note
      if (Object.keys(noteExams).length === 0) {
        console.log('Aucune note d\'examen trouvée');
        setLoadingNoteMoyenne(false);
        return;
      }
      
      console.log('Notes extraites pour le calcul de moyenne:', noteExams);
      
      // Appeler l'API note_moyenne_proxy
      const response = await axios.post(
        `${API_BASE_URL}/proxy-note-moyenne/note-moyenne`,
        noteExams,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const noteMoyenneValue = Array.isArray(response.data)
        ? response.data?.[0]?.output?.noteMoyenne
        : response.data?.output?.noteMoyenne;

      if (noteMoyenneValue) {
        setNoteMoyenne(noteMoyenneValue);
        console.log('Note moyenne calculée:', noteMoyenneValue);
      } else {
        console.error('Format de réponse invalide pour la note moyenne:', response.data);
      }
      
    } catch (error) {
      console.error('Erreur lors du calcul de la note moyenne:', error);
    } finally {
      setLoadingNoteMoyenne(false);
    }
  };

  // Fonction pour récupérer le prénom de l'utilisateur
  const getUserFirstName = () => {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const userData = JSON.parse(userInfo);
        return userData.prenom || 'Utilisateur';
      }
      return 'Utilisateur';
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      return 'Utilisateur';
    }
  };

  // Affichage du chargement
  if (loading) {
    const userFirstName = getUserFirstName();
    
    return (
      <MDBox 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          overflow: 'auto'
        }}
      >
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              maxWidth: 600, 
              width: '100%',
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <MDBox mb={4} mt={1}>
              <LogoLoader>
                <Typography className="loading-text">
                  Correction en cours...
                </Typography>
                <Typography className="loading-subtext">
                  Analyse de vos réponses
                </Typography>
                
                <Box className="logo-container"> 
                  <Box className="logo-ring-2" />
                  <Box className="logo-ring" />
                  <Box 
                    component="img" 
                    src={tcfCanadaLogo} 
                    alt="TCF Canada" 
                    className="logo-image"
                  />
                </Box>
               
                <Box className="dots">
                  <span />
                  <span />
                  <span />
                </Box>
              </LogoLoader>
              
              <MDTypography variant="body2" color="text" fontStyle="italic" mt={3}>
                Cela peut prendre environ 60 secondes...
              </MDTypography>
              
              <MDTypography variant="body1" color="dark" fontWeight="medium" mt={2}>
                Merci de patienter, {userFirstName} !
              </MDTypography>
            </MDBox>
          </Card>
        </Fade>
      </MDBox>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <MDBox 
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          pl:25,
          overflow: 'auto'
        }}
      >
        <Card 
          sx={{ 
            maxWidth: 600, 
            p: 4, 
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            background: 'rgba(255,255,255,0.95)'
          }}
        >
          <MDBox mb={2}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                backgroundColor: '#ef4444', 
                margin: '0 auto 16px'
              }}
            >
              <Icon sx={{ fontSize: 40, color: 'white' }}>error</Icon>
            </Avatar>
            <MDTypography variant="h4" fontWeight="bold" color="error" mb={1}>
              Erreur
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3}>
              {error}
            </MDTypography>
            <MDButton 
              variant="contained" 
              color="primary" 
              onClick={() => { navigate('/simulateur-tcf-expression-orale'); window.location.reload(); }}
              sx={({ palette: { gradients }, functions: { linearGradient } }) => ({
                backgroundImage: linearGradient(gradients.primaryToSecondary.main, gradients.primaryToSecondary.state),
                borderRadius: 3,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(79, 204, 231, 1)',
                  boxShadow: '0 4px 20px 0 rgba(79, 204, 231, 0.4)',
                },
              })}
            >
              Retour aux sujets
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    );
  }

  // Fonction pour obtenir la couleur selon la note
  const getScoreColor = (score) => {
    if (!score) return 'text.secondary';
    const numScore = parseFloat(score.replace(/[^0-9.]/g, ''));
    if (numScore >= 16) return 'success.main';
    if (numScore >= 12) return 'warning.main';
    return 'error.main';
  };

  // Fonction pour obtenir l'icône selon la note
  const getScoreIcon = (score) => {
    if (!score) return 'help_outline';
    const numScore = parseFloat(score.replace(/[^0-9.]/g, ''));
    if (numScore >= 16) return 'emoji_events';
    if (numScore >= 12) return 'thumb_up';
    return 'trending_up';
  };

  // Rendu principal des résultats
  return (
    <MDBox 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto'
      }}
    >
      <Dialog
        open={true}
        maxWidth="1350px"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
            color: 'white',
            textAlign: 'center',
            py: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
            }
          }}
        >
          <MDBox display="flex" alignItems="center" justifyContent="space-between" px={2}>
            {/* Section gauche avec icône et titre */}
            <MDBox display="flex" alignItems="center" flexDirection="column">
              <Icon sx={{ fontSize: '2rem', mb: 0.5, opacity: 0.9 }}>check_circle</Icon>
              <MDTypography variant="h5" fontWeight="bold" color="white">
                Résultats de votre évaluation
              </MDTypography>
              <MDTypography variant="body2" color="white" opacity={0.9} mt={0.5}>
                {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </MDTypography>
            </MDBox>
            
            {/* Section droite avec note et icône attractive */}
            <MDBox display="flex" alignItems="center" flexDirection="column">
              {loadingNoteMoyenne ? (
                <MDBox display="flex" alignItems="center" mb={2}>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
                  <MDTypography variant="h6" color="white" fontWeight="medium">
                    Calcul en cours...
                  </MDTypography>
                </MDBox>
              ) : (
                <Tooltip title="Votre niveau global" placement="top" arrow>
                  <MDBox
                    display="flex"
                    alignItems="center"
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%)',
                      borderRadius: '16px',
                      padding: '12px 20px',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                      border: '2px solid rgba(255,255,255,0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      backdropFilter: 'blur(10px)',
                      mb: 2,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3), transparent 70%)',
                        zIndex: 0
                      },
                      '&:hover': {
                        transform: 'scale(1.05)',
                        transition: 'transform 0.3s ease'
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        mr: 2,
                        zIndex: 1
                      }}
                    >
                      <Icon sx={{ fontSize: '1.8rem', color: 'white' }}>emoji_events</Icon>
                    </Avatar>
                    <MDBox sx={{ zIndex: 1 }}>
                      <MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        Note Globale
                      </MDTypography>
                      <MDTypography variant="h4" fontWeight="bold" color="white" lineHeight={1}>
                        {noteMoyenne || "B1"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Tooltip>
              )}
              <MDBox 
                display="flex" 
                alignItems="center" 
                sx={{ 
                  cursor: 'pointer', 
                  '&:hover': { 
                    transform: 'scale(1.05)',
                    transition: 'transform 0.2s ease'
                  } 
                }}
                onClick={() => navigate('/simulateur-tcf-expression-orale')}
              >
                <Icon sx={{ fontSize: '1.2rem', mr: 0.5, color: 'rgba(255,255,255,0.9)' }}>refresh</Icon>
                <MDTypography variant="caption" color="white" fontWeight="medium" sx={{ opacity: 0.9 }}>
                  Passer un autre examen
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <MDBox p={4}>
            <MDTypography variant="body1" color="text" mb={4}>
              Voici les résultats détaillés de votre examen d'expression orale TCF Canada
            </MDTypography>
            
            {/* Résultats par tâche */}
            {results && Array.isArray(results) && results.length > 0 ? (
              results.map((taskResult, index) => {
                // Ignorer les tâches vides (pas de clé output)
                if (!taskResult || !taskResult.output || Object.keys(taskResult.output).length === 0) {
                  return null;
                }
                const taskKey = Object.keys(taskResult.output)[0];
                const taskData = taskResult.output[taskKey];
                const task = subject?.tasks[index];
                const corrections = (Array.isArray(taskData?.corrections_taches)
                  ? taskData.corrections_taches.filter(Boolean)
                  : (taskData?.corrections_taches ? [taskData.corrections_taches] : [])
                ).map(c => c.replace(/\\n/g, '\n'));
                const pointsForts = taskData?.pointsForts || [];
                const pointsAmeliorer = taskData?.pointsAmeliorer || [];

                return (
                  <Fade in timeout={500 + (index * 200)} key={index}>
                    <Card 
                      sx={{ 
                        mb: 4, 
                        overflow: 'hidden',
                        borderRadius: 4,
                        boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                      }}
                    >
                      {/* En-tête de la tâche */}
                      <MDBox
                        sx={{
                          background: task?.theme === 'immigration' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : task?.theme === 'travail'
                            ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                            : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: 'white',
                          p: 3
                        }}
                      >
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDBox>
                              <MDTypography variant="h5" fontWeight="bold" color="white" mb={1} component="div">
                                <div dangerouslySetInnerHTML={{ __html: task?.title || `Tâche ${index + 1}: Expression orale` }} />
                              </MDTypography>
                            <MDTypography variant="body2" color="white" opacity={0.9}>
                              Thème: {task?.theme || 'Général'}
                            </MDTypography>
                          </MDBox>
                          
                          <MDBox display="flex" alignItems="center" gap={2}>
                            {taskData.NoteExam && (
                              <Tooltip title="Votre niveau actuel" placement="top" arrow>
                                <MDBox
                                  display="flex"
                                  alignItems="center"
                                  sx={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #667eea 100%)',
                                    borderRadius: '12px',
                                    padding: '6px 12px',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%)',
                                      zIndex: 0
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      mr: 1
                                    }}
                                  >
                                    <Icon sx={{ fontSize: '1.2rem', color: 'white' }}>school</Icon>
                                  </Avatar>
                                  <MDBox>
                                    <MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                      Niveau actuel
                                    </MDTypography>
                                    <MDTypography variant="h6" fontWeight="bold" color="white" lineHeight={1}>
                                      {taskData.NoteExam}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              </Tooltip>
                            )}
                            {taskData.NoteExamCorrection && (
                              <Tooltip title="Note de l'examinateur pour cette tâche" arrow>
                                <MDBox 
                                  display="flex" 
                                  alignItems="center"
                                  sx={{
                                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                    borderRadius: '12px',
                                    padding: '6px 12px',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                                    border: '2px solid rgba(255,255,255,0.2)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    animation: `${pulseAnimation} 2s ease-in-out 1`,
                                    '&::before': {
                                      content: '""',
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 70%)',
                                      zIndex: 0
                                    }
                                  }}
                                >
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      mr: 1
                                    }}
                                  >
                                    <Icon sx={{ fontSize: '1.2rem', color: 'white' }}>trending_up</Icon>
                                  </Avatar>
                                  <MDBox>
                                    <MDTypography variant="caption" fontWeight="bold" color="white" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                      Potentiel
                                    </MDTypography>
                                    <MDTypography variant="h6" fontWeight="bold" color="white" lineHeight={1}>
                                      {taskData.NoteExamCorrection}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              </Tooltip>
                            )}
                          </MDBox>
                        </MDBox>
                      </MDBox>
                      
                      <MDBox p={3}>
                        {/* Section avec deux colonnes: Votre réponse et Corrections proposées */}
                        <Grid container spacing={3}>
                          {/* Votre réponse */}
                          <Grid item xs={12} md={5}>
                            <MDBox 
                              p={3} 
                              sx={{
                                background: '#f8f9fa',
                                borderRadius: 2,
                                border: '1px solid #e9ecef',
                                height: '100%',
                                minHeight: '250px',
                                overflow: 'auto'
                              }}
                            >
                              <MDTypography variant="h6" fontWeight="bold" color="dark" mb={2}>
                                Votre réponse:
                              </MDTypography>
                              <MDTypography variant="body2" color="text" lineHeight={1.8} component="div">
                                <div>
                                  {responses[index] ? 
                                    responses[index]
                                      .split(' Candidat:')
                                      .slice(1)
                                      .map((response, responseIndex) => {
                                        // Nettoyer la réponse en supprimant les parties Examinateur suivantes
                                        const cleanResponse = response.split(' Examinateur:')[0].trim();
                                        return cleanResponse ? (
                                          <div key={responseIndex} style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '6px', borderLeft: '3px solid #007bff' }}>
                                            <strong style={{ color: '#007bff' }}>Vous:</strong> {cleanResponse}
                                          </div>
                                        ) : null;
                                      })
                                      .filter(Boolean)
                                    : 'Aucune réponse fournie'
                                  }
                                </div>
                              </MDTypography>
                            </MDBox>
                          </Grid>
                          
                          {/* Corrections proposées */}
                          <Grid item xs={12} md={7}>
                            <MDBox 
                              p={3} 
                              sx={{
                                background: '#f0f9ff',
                                borderRadius: 2,
                                border: '1px solid #cfe2ff',
                                height: '100%',
                                minHeight: '250px',
                                overflow: 'auto'
                              }}
                            >
                              <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                                {corrections.length > 1 ? 'Corrections proposées :' : 'Correction proposée :'}
                              </MDTypography>
                              
                              {corrections.length > 0 ? (
                                corrections.map((correction, correctionIndex) => (
                                  <MDBox key={correctionIndex} mb={corrections.length > 1 ? 3 : 0}>
                                    {corrections.length > 1 && (
                                      <MDTypography variant="subtitle2" fontWeight="bold" color="primary" mb={1}>
                                        Proposition {correctionIndex + 1}:
                                      </MDTypography>
                                    )}
                                    <MDBox 
                                      sx={{
                                        '& p': { margin: '8px 0', fontSize: '0.875rem', lineHeight: 1.8 },
                                        '& h1, & h2, & h3, & h4, & h5, & h6': { margin: '16px 0 8px 0', fontWeight: 'bold' },
                                        '& ul, & ol': { margin: '8px 0', paddingLeft: '20px' },
                                        '& li': { margin: '4px 0' },
                                        '& strong': { fontWeight: 'bold' },
                                        '& em': { fontStyle: 'italic' },
                                        '& code': { 
                                          backgroundColor: '#f5f5f5', 
                                          padding: '2px 4px', 
                                          borderRadius: '3px',
                                          fontSize: '0.85em'
                                        },
                                        '& pre': {
                                          backgroundColor: '#f5f5f5',
                                          padding: '12px',
                                          borderRadius: '6px',
                                          overflow: 'auto',
                                          margin: '12px 0'
                                        },
                                        '& blockquote': {
                                          borderLeft: '4px solid #ddd',
                                          paddingLeft: '16px',
                                          margin: '12px 0',
                                          fontStyle: 'italic'
                                        }
                                      }}
                                    >
                                      <ReactMarkdown>{correction}</ReactMarkdown>
                                    </MDBox>
                                  </MDBox>
                                ))
                              ) : (
                                <MDTypography variant="body2" color="text" style={{ fontStyle: 'italic' }}>
                                  Aucune correction disponible pour cette tâche.
                                </MDTypography>
                              )}
                              
                             
                            </MDBox>
                          </Grid>

                          {/* Points forts et à améliorer pour cette tâche */}
                          <Grid item xs={12}>
                            <MDBox mt={3}>
                              {/* Afficher un message si les deux listes sont vides */}
                              {(pointsForts.length === 0 && pointsAmeliorer.length === 0) ? (
                                <Card 
                                  sx={{ 
                                    p: 4, 
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)',
                                    textAlign: 'center'
                                  }}
                                >
                                 
                                  <MDTypography variant="h6" fontWeight="bold" color="dark" mb={1}>
                                    Aucun résultat disponible
                                  </MDTypography>
                                  
                                </Card>
                              ) : (
                                <Grid container spacing={3}>
                                  {/* Points forts */}
                                  {pointsForts.length > 0 && (
                                    <Grid item xs={12} md={pointsAmeliorer.length > 0 ? 6 : 12}>
                                      <MDBox mb={2}>
                                        <MDTypography variant="h6" fontWeight="bold" color="dark">
                                          <Icon sx={{ mr: 1, verticalAlign: 'middle', color: '#10b981' }}>recommend</Icon>
                                          Points forts
                                        </MDTypography>
                                      </MDBox>
                                      
                                      <Card 
                                        sx={{ 
                                          p: 3, 
                                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                          borderRadius: 3,
                                          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                          border: '1px solid rgba(16, 185, 129, 0.2)'
                                        }}
                                      >
                                        <List>
                                          {/* Afficher les points forts traduits s'ils existent, sinon afficher les originaux */}
                                          {(taskData.pointsFortsTraduit && taskData.pointsFortsTraduit.length > 0 ? taskData.pointsFortsTraduit : pointsForts).map((point, pointIndex) => (
                                            <Fade in timeout={800 + (pointIndex * 200)} key={pointIndex}>
                                              <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon>
                                                  <Avatar 
                                                    sx={{ 
                                                      width: 36, 
                                                      height: 36, 
                                                      backgroundColor: '#10b981'
                                                    }}
                                                  >
                                                    <Icon sx={{ fontSize: 20, color: 'white' }}>check</Icon>
                                                  </Avatar>
                                                </ListItemIcon>
                                                <ListItemText 
                                                  primary={point}
                                                  primaryTypographyProps={{
                                                    fontWeight: 500,
                                                    color: '#065f46'
                                                  }}
                                                />
                                              </ListItem>
                                            </Fade>
                                          ))}
                                        </List>
                                      </Card>
                                    </Grid>
                                  )}
                                  
                                  {/* Points à améliorer */}
                                  {pointsAmeliorer.length > 0 && (
                                    <Grid item xs={12} md={pointsForts.length > 0 ? 6 : 12}>
                                      <MDBox mb={2} display="flex" justifyContent="space-between" alignItems="center">
                                        <MDTypography variant="h6" fontWeight="bold" color="dark">
                                          <Icon sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }}>trending_up</Icon>
                                          Points à améliorer
                                        </MDTypography>
                                        
                                        {/* Bouton de traduction à droite du titre */}
                                        {(pointsForts.length > 0 || pointsAmeliorer.length > 0) && (
                                          <Tooltip title="Traduire les commentaires de cette tâche" arrow placement="top">
                                            <MDButton
                                              variant="outlined"
                                              color="info"
                                              size="small"
                                              onClick={() => {
                                                setCurrentTaskToTranslate(index);
                                                setTranslationOpen(true);
                                              }}
                                              sx={{
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                  transform: 'translateY(-2px)',
                                                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }
                                              }}
                                            >
                                              <Icon>translate</Icon>
                                              TRADUIRE
                                            </MDButton>
                                          </Tooltip>
                                        )}
                                      </MDBox>
                                      
                                      <Card 
                                        sx={{ 
                                          p: 3, 
                                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                          borderRadius: 3,
                                          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                          border: '1px solid rgba(245, 158, 11, 0.2)'
                                        }}
                                      >
                                        <List>
                                          {/* Afficher les points à améliorer traduits s'ils existent, sinon afficher les originaux */}
                                          {(taskData.pointsAmeliorerTraduit && taskData.pointsAmeliorerTraduit.length > 0 ? taskData.pointsAmeliorerTraduit : pointsAmeliorer).map((point, pointIndex) => (
                                            <Fade in timeout={1000 + (pointIndex * 200)} key={pointIndex}>
                                              <ListItem sx={{ px: 0 }}>
                                                <ListItemIcon>
                                                  <Avatar 
                                                    sx={{ 
                                                      width: 36, 
                                                      height: 36, 
                                                      backgroundColor: '#f59e0b'
                                                    }}
                                                  >
                                                    <Icon sx={{ fontSize: 20, color: 'white' }}>trending_up</Icon>
                                                  </Avatar>
                                                </ListItemIcon>
                                                <ListItemText 
                                                  primary={point}
                                                  primaryTypographyProps={{
                                                    fontWeight: 500,
                                                    color: '#92400e'
                                                  }}
                                                />
                                              </ListItem>
                                            </Fade>
                                          ))}
                                        </List>
                                      </Card>
                                    </Grid>
                                  )}
                                </Grid>
                              )}
                            </MDBox>
                          </Grid>
                        </Grid>
                      </MDBox>
                    </Card>
                  </Fade>
                );
              })
          ) : (
            <MDTypography variant="body1" color="text" textAlign="center" py={4}>
              Aucune correction disponible pour le moment.
            </MDTypography>
          )}
        </MDBox>

        {/* Boutons d'action */}
        <Fade in timeout={2000}>
          <MDBox 
            mt={4} 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              width: '100%',
              px: 2
            }}
          >
            <MDButton 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/simulateur-tcf-expression-orale')}
              sx={{
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
                minWidth: '220px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.6)',
                }
              }}
            >
              Retour au simulateur
            </MDButton>
          
            <MDButton 
              variant="contained" 
              color="success" 
              size="large"
              onClick={() => window.open('https://reussir-tcfcanada.com/expression-orale/', '_blank')}
              startIcon={<Icon>record_voice_over</Icon>}
              sx={{
                background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                boxShadow: '0 4px 15px rgba(46, 125, 50, 0.4)',
                minWidth: '280px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20 0%, #0d4f14 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.6)',
                }
              }}
            >
              Sujet d'actualité expression orale
            </MDButton>
          </MDBox>
        </Fade>
        </DialogContent>
      </Dialog>

      {/* Modal de traduction */}
      <Dialog 
        open={translationOpen} 
        onClose={handleCloseTranslation}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <MDBox display="flex" alignItems="center">
            <Icon sx={{ mr: 1 }}>translate</Icon>
            <MDTypography variant="h6" fontWeight="bold">
              Traduire les commentaires
            </MDTypography>
          </MDBox>
        </DialogTitle>
        
        <DialogContent>
          <MDBox mb={3}>
            <FormControl fullWidth>
              <InputLabel>Langue cible</InputLabel>
              <Select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                label="Langue cible"
              >
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </MDBox>
          
          {translationError && (
            <MDBox mb={2}>
              <MDTypography variant="body2" color="error">
                {translationError}
              </MDTypography>
            </MDBox>
          )}
          
          {translating && (
            <MDBox display="flex" alignItems="center" justifyContent="center" py={3}>
              <CircularProgress sx={{ mr: 2 }} />
              <MDTypography variant="body1">
                Traduction en cours...
              </MDTypography>
            </MDBox>
          )}
          
          {translatedResults && (
            <MDBox>
              <MDTypography variant="h6" fontWeight="bold" color="success" mb={2}>
                Traduction terminée !
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Les commentaires ont été traduits et sont maintenant affichés dans la langue sélectionnée.
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        
        <DialogActions>
          <MDButton onClick={handleCloseTranslation}>
            Fermer
          </MDButton>
          <MDButton 
            variant="contained" 
            onClick={translateFeedback}
            disabled={translating || !targetLang}
          >
            Traduire
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}

export default TCFResultsInterface;