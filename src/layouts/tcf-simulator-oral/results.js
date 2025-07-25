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
import { alpha } from "@mui/material/styles";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Services
import TCFAdminService from "services/tcfAdminService";
import authService from "services/authService";
import { Paper } from "@mui/material";

// Animation CSS pour le chargement
const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
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
  const saveResultsToAPI = async (correctionResults, subjectData) => {
    try {
      setSaving(true);
      const userId = getUserIdFromToken();
      
      // Préparer les données pour chaque tâche en utilisant le nouveau format
      const savePromises = correctionResults.map(async (taskResult, index) => {
        const taskKey = Object.keys(taskResult.output)[0]; // tache1, tache2, etc.
        const taskData = taskResult.output[taskKey];
        const task = subjectData.tasks[index];
        const taskResponse = responses[index] || '';
        
        const payload = {
          id_user: userId,
          id_subject: parseInt(subjectId),
          id_task: task.id || index + 1,
          reponse_utilisateur: taskResponse,
          score: taskData.NoteExam || '',
          reponse_ia: taskData.corrections_taches?.[0] || '',
          points_fort: taskData.pointsForts?.join(', ') || '',
          point_faible: taskData.pointsAmeliorer?.join(', ') || '',
          traduction_reponse_ia: null
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
      const taskKey = Object.keys(taskResult.output)[0];
      const taskData = taskResult.output[taskKey];
      
      if (taskData.pointsForts) taskPointsForts = taskData.pointsForts;
      if (taskData.pointsAmeliorer) taskPointsAmeliorer = taskData.pointsAmeliorer;
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
          `${API_BASE_URL}/proxy/translate`,
          payload,
          { headers: { 'Content-Type': 'application/json' } }
        );
        
        if (response.data && response.data.output) {
          setTranslatedResults({
            taskIndex: currentTaskToTranslate,
            pointsForts: response.data.output.pointsForts || [],
            pointsAmeliorer: response.data.output.pointsAmeliorer || []
          });
          setTranslating(false);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (apiError) {
        console.error(`Tentative de traduction ${retryCount + 1} échouée:`, apiError);
        
        if (retryCount < 2) { // Retry jusqu'à 3 fois (0-2)
          console.log(`Nouvelle tentative de traduction dans 2 secondes... (${retryCount + 2}/3)`);
          setTimeout(() => {
            makeTranslationAPICall(retryCount + 1);
          }, 2000);
        } else {
          console.error('Toutes les tentatives de traduction ont échoué');
          setTranslationError("Erreur lors de la traduction après 3 tentatives. Veuillez réessayer.");
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
          setResponses(responsesData);
        }
        
        // Vérifier s'il y a des sessions complètes non incluses dans les réponses
        for (let i = 0; i < subjectData.tasks.length; i++) {
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
        
        // Fonction pour effectuer l'appel API avec retry
        const makeAPICall = async (retryCount = 0) => {
          try {
            // Appel réel à l'API de correction ORAL
            const response = await axios.post(
              `${API_BASE_URL}/proxy/oral`,
              payload,
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            // Traiter la réponse de l'API
            if (response.data && Array.isArray(response.data)) {
              setResults(response.data);
              
              // Calculer la note moyenne
              await calculateNoteMoyenne(response.data);
              
              // Enregistrer les résultats via l'API d'enregistrement, en passant subjectData
              await saveResultsToAPI(response.data, subjectData);
              
              // Supprimer les entrées localStorage inutiles après traitement
              localStorage.removeItem(`exam_subject_${subjectId}`);
              localStorage.removeItem(`tcf-oral-responses-${subjectId}`);
              
              setLoading(false);
            } else {
              throw new Error('Format de réponse invalide');
            }
          } catch (apiError) {
            console.error(`Tentative ${retryCount + 1} échouée:`, apiError);
            
            if (retryCount < 4) { // Retry jusqu'à 5 fois (0-4)
              console.log(`Nouvelle tentative dans 2 secondes... (${retryCount + 2}/5)`);
              setTimeout(() => {
                makeAPICall(retryCount + 1);
              }, 2000); // Attendre 2 secondes avant de réessayer
            } else {
              console.error('Toutes les tentatives ont échoué');
              setError("Une erreur s'est produite lors de la correction après 5 tentatives. Veuillez réessayer.");
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
          const taskKey = Object.keys(taskResult.output)[0];
          const taskData = taskResult.output[taskKey];
          const noteExam = taskData.NoteExam || '';
          
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
      
      if (response.data && response.data.output && response.data.output.noteMoyenne) {
        setNoteMoyenne(response.data.output.noteMoyenne);
        console.log('Note moyenne calculée:', response.data.output.noteMoyenne);
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
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
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
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                }}
              >
                <Icon sx={{ fontSize: 40, color: 'white' }}>auto_fix_high</Icon>
              </Box>
              
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
                Correction en cours...
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={4}>
                Nous analysons vos réponses et préparons
                <br />
                votre évaluation personnalisée.
              </MDTypography>
              
              <MDBox 
                sx={{
                  height: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #667eea, #764ba2, #667eea)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${spinAnimation} 3s linear infinite`,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon sx={{ fontSize: 32, color: '#667eea' }}>psychology</Icon>
                  </Box>
                </Box>
              </MDBox>
              
              <MDTypography variant="h6" color="primary" mb={2}>
                Bonjour {userFirstName} !
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Notre IA analyse votre expression orale...
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
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Card sx={{ maxWidth: 500, width: '100%', p: 4, textAlign: 'center' }}>
          <Icon sx={{ fontSize: 64, color: 'error.main', mb: 2 }}>error_outline</Icon>
          <MDTypography variant="h4" fontWeight="bold" color="error" mb={2}>
            Erreur
          </MDTypography>
          <MDTypography variant="body1" color="text" mb={3}>
            {error}
          </MDTypography>
          <MDButton 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
          >
            Retour au simulateur
          </MDButton>
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
        minHeight: '100vh',
        background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
        py: 4
      }}
    >
      <MDBox maxWidth="1200px" mx="auto" px={3}>
        {/* En-tête avec note moyenne */}
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              mb: 4, 
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
            }}
          >
            <MDBox mb={3}>
              <Icon sx={{ fontSize: 64, color: 'success.main', mb: 2 }}>celebration</Icon>
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
                Félicitations ! Votre évaluation est prête
              </MDTypography>
              <MDTypography variant="body1" color="text">
                Voici les résultats détaillés de votre examen d'expression orale TCF Canada
              </MDTypography>
            </MDBox>
            
            {/* Note moyenne */}
            {loadingNoteMoyenne ? (
              <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                <CircularProgress size={24} />
                <MDTypography variant="h6" color="text">
                  Calcul de la note moyenne...
                </MDTypography>
              </Box>
            ) : noteMoyenne ? (
              <Zoom in timeout={1500}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <Icon sx={{ fontSize: 32 }}>star</Icon>
                  <Box>
                    <MDTypography variant="h4" fontWeight="bold">
                      {noteMoyenne}
                    </MDTypography>
                    <MDTypography variant="body2" sx={{ opacity: 0.9 }}>
                      Note moyenne
                    </MDTypography>
                  </Box>
                </Box>
              </Zoom>
            ) : null}
          </Card>
        </Fade>

        {/* En-tête de la tâche en cours */}
        <Fade in timeout={800}>
          <Card 
            sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
            }}
          >
            <MDBox display="flex" alignItems="center" justifyContent="space-between">
              <MDTypography variant="h5" fontWeight="bold" color="primary">
                Tâche en cours: {subject?.currentTask?.title || 'Expression orale'}
              </MDTypography>
              <Chip 
                icon={<Icon>check_circle</Icon>} 
                label="Examen terminé" 
                color="success" 
                variant="outlined" 
              />
            </MDBox>
          </Card>
        </Fade>
        
        {/* Résultats par tâche */}
        <Grid container spacing={3}>
          {results && Array.isArray(results) && results.map((taskResult, index) => {
            const taskKey = Object.keys(taskResult.output)[0];
            const taskData = taskResult.output[taskKey];
            const task = subject?.tasks[index];
            const userResponse = responses[index] || '';
            
            // Vérifier si on a des résultats traduits pour cette tâche
            const hasTranslation = translatedResults && translatedResults.taskIndex === index;
            const displayPointsForts = hasTranslation ? translatedResults.pointsForts : taskData.pointsForts;
            const displayPointsAmeliorer = hasTranslation ? translatedResults.pointsAmeliorer : taskData.pointsAmeliorer;
            
            return (
              <Grid item xs={12} key={index}>
                <Fade in timeout={1000 + (index * 200)}>
                  <Card 
                    sx={{ 
                      p: 4,
                      borderRadius: 4,
                      background: 'rgba(255,255,255,0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    {/* En-tête de la tâche */}
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                      <MDBox>
                        <MDTypography variant="h4" fontWeight="bold" color="dark" mb={1}>
                          {task?.title || `Tâche ${index + 1}`}
                        </MDTypography>
                        <Chip 
                          icon={<Icon>{getScoreIcon(taskData.NoteExam)}</Icon>}
                          label={taskData.NoteExam || 'Non évalué'}
                          sx={{ 
                            color: 'white',
                            backgroundColor: getScoreColor(taskData.NoteExam),
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                          }}
                        />
                      </MDBox>
                      
                      <MDButton
                        variant="outlined"
                        color="info"
                        size="small"
                        startIcon={<Icon>translate</Icon>}
                        onClick={() => handleOpenTranslation(index)}
                      >
                        Traduire
                      </MDButton>
                    </MDBox>

                    <Grid container spacing={3}>
                      {/* Votre réponse */}
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            height: '100%',
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #f8f9fa, #e9ecef)'
                          }}
                        >
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ mr: 1, color: 'primary.main' }}>person</Icon>
                            <MDTypography variant="h6" fontWeight="bold" color="primary">
                              Votre réponse
                            </MDTypography>
                          </MDBox>
                          
                          <MDBox 
                            sx={{ 
                              maxHeight: '200px', 
                              overflowY: 'auto',
                              p: 2,
                              backgroundColor: 'white',
                              borderRadius: 2,
                              border: '1px solid #e0e0e0'
                            }}
                          >
                            <MDTypography 
                              variant="body2" 
                              color="text" 
                              sx={{ lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: userResponse || 'Aucune réponse fournie' }}
                            />
                          </MDBox>
                        </Paper>
                      </Grid>

                      {/* Correction IA */}
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3, 
                            height: '100%',
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #e8f5e8, #c8e6c9)'
                          }}
                        >
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ mr: 1, color: 'success.main' }}>smart_toy</Icon>
                            <MDTypography variant="h6" fontWeight="bold" color="success">
                              Correction IA
                            </MDTypography>
                          </MDBox>
                          
                          <MDBox 
                            sx={{ 
                              maxHeight: '200px', 
                              overflowY: 'auto',
                              p: 2,
                              backgroundColor: 'white',
                              borderRadius: 2,
                              border: '1px solid #c8e6c9'
                            }}
                          >
                            <MDTypography 
                              variant="body2" 
                              color="text" 
                              sx={{ lineHeight: 1.6 }}
                              dangerouslySetInnerHTML={{ __html: taskData.corrections_taches?.[0] || 'Aucune correction disponible' }}
                            />
                          </MDBox>
                        </Paper>
                      </Grid>

                      {/* Points forts */}
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #e8f5e8, #c8e6c9)'
                          }}
                        >
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ mr: 1, color: 'success.main' }}>thumb_up</Icon>
                            <MDTypography variant="h6" fontWeight="bold" color="success">
                              Points forts
                            </MDTypography>
                          </MDBox>
                          
                          <List dense>
                            {displayPointsForts && displayPointsForts.length > 0 ? (
                              displayPointsForts.map((point, pointIndex) => (
                                <ListItem key={pointIndex} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Icon sx={{ color: 'success.main', fontSize: 20 }}>check_circle</Icon>
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={
                                      <MDTypography 
                                        variant="body2" 
                                        color="text"
                                        dangerouslySetInnerHTML={{ __html: point }}
                                      />
                                    }
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <MDTypography variant="body2" color="text" sx={{ fontStyle: 'italic' }}>
                                Aucun point fort identifié
                              </MDTypography>
                            )}
                          </List>
                        </Paper>
                      </Grid>

                      {/* Points à améliorer */}
                      <Grid item xs={12} md={6}>
                        <Paper 
                          elevation={2} 
                          sx={{ 
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(145deg, #fff3e0, #ffcc02)'
                          }}
                        >
                          <MDBox display="flex" alignItems="center" mb={2}>
                            <Icon sx={{ mr: 1, color: 'warning.main' }}>trending_up</Icon>
                            <MDTypography variant="h6" fontWeight="bold" color="warning">
                              Points à améliorer
                            </MDTypography>
                          </MDBox>
                          
                          <List dense>
                            {displayPointsAmeliorer && displayPointsAmeliorer.length > 0 ? (
                              displayPointsAmeliorer.map((point, pointIndex) => (
                                <ListItem key={pointIndex} sx={{ px: 0 }}>
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    <Icon sx={{ color: 'warning.main', fontSize: 20 }}>lightbulb</Icon>
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary={
                                      <MDTypography 
                                        variant="body2" 
                                        color="text"
                                        dangerouslySetInnerHTML={{ __html: point }}
                                      />
                                    }
                                  />
                                </ListItem>
                              ))
                            ) : (
                              <MDTypography variant="body2" color="text" sx={{ fontStyle: 'italic' }}>
                                Aucun point d'amélioration identifié
                              </MDTypography>
                            )}
                          </List>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Card>
                </Fade>
              </Grid>
            );
          })}
        </Grid>

        {/* Boutons d'action */}
        <Fade in timeout={2000}>
          <MDBox textAlign="center" mt={4}>
            <MDButton 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ mr: 2 }}
            >
              Retour au simulateur
            </MDButton>
            <MDButton 
              variant="outlined" 
              color="secondary" 
              size="large"
              onClick={() => navigate('/dashboard')}
            >
              Tableau de bord
            </MDButton>
          </MDBox>
        </Fade>
      </MDBox>

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