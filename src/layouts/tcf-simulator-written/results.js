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
  const saveResultsToAPI = async (correctionResults, subjectData, userResponses) => {
    try {
      setSaving(true);
      const userId = getUserIdFromToken();
      
      // Préparer les données pour chaque tâche en utilisant le nouveau format
      const savePromises = correctionResults.map(async (taskResult, index) => {
        const taskKey = Object.keys(taskResult.output)[0]; // tache1, tache2, etc.
        const taskData = taskResult.output[taskKey];
        const task = subjectData.tasks[index];
        const taskResponse = userResponses[index] || '';
        
        const payload = {
          id_user: userId,
          id_subject: parseInt(subjectId),
          id_task: task.id || index + 1,
          reponse_utilisateur: taskResponse, // Stocker uniquement le texte brut
          score: taskData.NoteExam || '',
          reponse_ia: taskData.corrections_taches || '',
          points_fort: taskData.pointsForts?.join(', ') || '',
          point_faible: taskData.pointsAmeliorer?.join(', ') || '',
          traduction_reponse_ia: null,
          type_exam: 'écrit'
        };
        
        console.log('Envoi de la réponse utilisateur:', payload.reponse_utilisateur);
        
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
          setTranslationError("Une erreur s'est produite lors de la traduction. Veuillez réessayer.");
          setTranslating(false);
        }
      }
    };
    
    // Démarrer l'appel API de traduction avec retry
    await makeTranslationAPICall();
  };




  // Rendu du modal de traduction
  const renderTranslationModal = () => {
    return (
      <Dialog
        open={translationOpen}
        onClose={() => setTranslationOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold">
            Traduire les commentaires
          </MDTypography>
        </DialogTitle>
        
        <DialogContent>
          <MDBox py={2}>
            <MDTypography variant="body2" color="text" mb={3}>
              Sélectionnez la langue dans laquelle vous souhaitez traduire les points forts et les points à améliorer.
            </MDTypography>
            
            <FormControl fullWidth variant="outlined">
              <InputLabel id="target-language-label">Langue cible</InputLabel>
              <Select
                style={{height:'44px'}}
                labelId="target-language-label"
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
            
            {translationError && (
              <MDTypography variant="body2" color="error" mt={2}>
                {translationError}
              </MDTypography>
            )}
          </MDBox>
        </DialogContent>
        
        <DialogActions>
          <MDButton
            onClick={() => setTranslationOpen(false)}
            color="secondary"
          >
            Annuler
          </MDButton>
          
          <MDButton
            onClick={translateFeedback}
            color="info"
            disabled={!targetLang || translating}
          >
            {translating ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Traduction en cours...
              </>
            ) : (
              'Traduire'
            )}
          </MDButton>
        </DialogActions>
      </Dialog>
    );
  };

  // Chargement du sujet et envoi des réponses pour correction
  useEffect(() => {
    const fetchSubjectAndSubmit = async () => {
      try {
        // Récupérer le sujet
        const subjectData = await TCFAdminService.getSubjectById(subjectId);
        setSubject(subjectData);
        
        // Récupérer les réponses
        const storedResponses = localStorage.getItem(`tcf-responses-${subjectId}`);
        const parsedResponses = storedResponses ? JSON.parse(storedResponses) : {};
        setResponses(parsedResponses);
        
        // Préparer les données pour l'API
        const taskResponses = Object.entries(parsedResponses)
        .map(([key, value], index) => `Reponse Tache ${index + 1} :\n${value}`)
        .join('\n\n');
        const taskStructures = subjectData.tasks.map(task => task.structure || '').join('\n\n');
        const taskInstructions = subjectData.tasks.map(task => task.instructions || '').join('\n\n');
        
        // Créer le tableau chatInput correctement pour inclure toutes les réponses
        const chatInputArray = Object.entries(parsedResponses)
        .sort(([a], [b]) => parseInt(a) - parseInt(b)) // Trier par index
        .map(([key, value]) => value || ''); // Extraire seulement les valeurs
        
        // Préparer les documents pour l'IA
        const taskDocuments = subjectData.tasks.map((task, index) => {
          if (task.documents && task.documents.length > 0) {
            const documentsText = task.documents.map((doc, docIndex) => 
              `Document ${docIndex + 1}: ${doc.content}`
            ).join('\n');
            return `Tache ${index + 1} - Documents de référence:\n${documentsText}`;
          }
          return `Tache ${index + 1} - Aucun document de référence`;
        }).join('\n\n');
        
        // Envoyer les données à l'API pour correction
        const payload = {
          Documents: subjectData.tasks.map((task, index) => {
            if (task.documents && task.documents.length > 0) {
              return task.documents.map(doc => doc.content || '').join(' ');
            }
            return '';
          }),
          Instructions: subjectData.tasks.map((task, index) => task.instructions || ''),
          Structures: subjectData.tasks.map((task, index) => task.structure || ''),
          Taches: subjectData.tasks.map((task, index) => task.title || ''),
          chatInput: chatInputArray,
          sessionId: `session-${Date.now()}`
        };
        
        // Fonction pour effectuer l'appel API avec retry
        const makeAPICall = async (retryCount = 0) => {
          try {
            // Appel réel à l'API de correction
            const response = await axios.post(
              `${API_BASE_URL}/proxy/correction`,
              payload,
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            // Traiter la réponse de l'API
            if (response.data && Array.isArray(response.data)) {
              setResults(response.data);
              
              // Calculer la note moyenne
              await calculateNoteMoyenne(response.data);
              
              // Enregistrer les résultats via l'API d'enregistrement, en passant subjectData et les réponses
              await saveResultsToAPI(response.data, subjectData, parsedResponses);
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
                    border: '8px solid #f3f3f3',
                    borderTop: '8px solid #667eea',
                    borderRadius: '50%',
                    animation: `${spinAnimation} 1s linear infinite`
                  }}
                />
              </MDBox>
              
              <MDTypography variant="body2" color="text" fontStyle="italic">
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

  // Affichage de l'erreur
  if (error) {
    return (
      <MDBox 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          pl:25
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
              onClick={() => { navigate('/tcf-simulator/written'); window.location.reload(); }}
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

  // Affichage des résultats
  return (
    <>
      <MDBox 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.8) 0%, rgba(240, 248, 255, 0.9) 30%, rgba(219, 234, 254, 0.85) 70%, rgba(191, 219, 254, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
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
                  Mai 2026
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
                  onClick={() => navigate('/simulateur-tcf-canada/expression-ecrits')}
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
              <Grid container spacing={4}>
                {/* Corrections détaillées */}
                <Grid item xs={12}>
                  <MDBox
                    sx={{
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      borderRadius: '16px',
                      p: 3,
                      mb: 3,
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <MDBox display="flex" alignItems="center" mb={3}>
                      <Icon sx={{ color: '#667eea', mr: 1, fontSize: '1.5rem' }}>assignment_turned_in</Icon>
                      <MDTypography variant="h6" fontWeight="bold" color="text">
                        Corrections détaillées
                      </MDTypography>
                    </MDBox>
                    {/* Corrections par tâche */}
                    <MDBox mb={2}>
                      {results && Array.isArray(results) && results.length > 0 ? (
                        results.map((taskResult, index) => {
                          // Récupérer la clé de la tâche (tache1, tache2, etc.)
                          const taskKey = Object.keys(taskResult.output)[0];
                          const taskData = taskResult.output[taskKey];
                          
                          // Récupérer les données de la tâche
                          const correction = taskData.corrections_taches || '';
                          const pointsForts = taskData.pointsForts || [];
                          const pointsAmeliorer = taskData.pointsAmeliorer || [];
                          const noteExam = taskData.NoteExam || '';
                          
                          // Vérifier si cette tâche a des traductions
                          const hasTranslations = translatedResults && translatedResults[`task${index}`];
                          const pointsFortsTraduit = hasTranslations ? translatedResults[`task${index}`].pointsFortsTraduit : [];
                          const pointsAmeliorerTraduit = hasTranslations ? translatedResults[`task${index}`].pointsAmeliorerTraduit : [];
                          
                          return (
                            <Fade in timeout={500 + (index * 300)} key={index}>
                              <Card 
                                sx={{ 
                                  mb: 4, 
                                  overflow: 'hidden',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                  borderRadius: 3,
                                  border: '1px solid rgba(102, 126, 234, 0.1)',
                                  transition: 'all 0.3s ease',
                                  minHeight: '400px',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                                  }
                                }}
                              >
                                <MDBox 
                                  p={3} 
                                  sx={{ 
                                    background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
                                    borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
                                  }}
                                >
                                  <MDBox display="flex" alignItems="center" justifyContent="space-between">
                                    <MDBox display="flex" alignItems="center">
                                      <Avatar
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          backgroundColor: '#667eea',
                                          mr: 2
                                        }}
                                      >
                                        <MDTypography variant="h6" color="white" fontWeight="bold">
                                          {index + 1}
                                        </MDTypography>
                                      </Avatar>
                                      <MDTypography variant="h5" fontWeight="bold" color="dark">
                                        Tâche {index + 1}
                                      </MDTypography>
                                    </MDBox>
                                    
                                    {/* Notes d'examen pour cette tâche - Version améliorée avec images */}
                                    <MDBox display="flex" alignItems="center" gap={2}>
                                      {noteExam && (
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
                                                {noteExam}
                                              </MDTypography>
                                            </MDBox>
                                          </MDBox>
                                        </Tooltip>
                                      )}
                                      
                                      {/* Note de correction proposée - Version améliorée avec image */}
                                      {taskData.NoteExamCorrection && (
                                        <Tooltip title="Niveau potentiel avec les corrections" placement="top" arrow>
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
                                  {/* Section avec deux colonnes: Votre réponse et Correction proposée */}
                                  <Grid container spacing={3}>
                                    {/* Documents de référence - Nouvelle section */}
                                    {subject?.tasks[index]?.documents && subject.tasks[index].documents.length > 0 && (
                                      <Grid item xs={12}>
                                        <MDBox 
                                          p={3} 
                                          mb={3}
                                          sx={{
                                            background: '#f0f7ff',
                                            borderRadius: 2,
                                            border: '1px solid #bfdbfe',
                                            overflow: 'auto'
                                          }}
                                        >
                                          <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                                            Documents de référence:
                                          </MDTypography>
                                          
                                          <Grid container spacing={2}>
                                            {subject.tasks[index].documents.map((document, docIndex) => (
                                              <Grid item xs={12} md={6} key={docIndex}>
                                                <Paper 
                                                  elevation={1} 
                                                  sx={{ 
                                                    p: 2, 
                                                    borderRadius: 2,
                                                    border: '1px solid #e5e7eb',
                                                    backgroundColor: '#ffffff'
                                                  }}
                                                >
                                                  <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                                                    Document {docIndex + 1}
                                                  </MDTypography>
                                                  <MDTypography variant="body2" component="div">
                                                    <div dangerouslySetInnerHTML={{ __html: document.content }} />
                                                  </MDTypography>
                                                </Paper>
                                              </Grid>
                                            ))}
                                          </Grid>
                                        </MDBox>
                                      </Grid>
                                    )}
                                    
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
                                        <MDTypography variant="body2" color="text" lineHeight={1.8}>
                                          {responses[index] || 'Aucune réponse fournie'}
                                        </MDTypography>
                                        <MDBox mt={2} display="flex" justifyContent="flex-end">
                                          <MDTypography variant="caption" color="text">
                                            {responses[index] ? responses[index].split(/\s+/).filter(word => word.length > 0).length : 0} mots
                                          </MDTypography>
                                        </MDBox>
                                      </MDBox>
                                    </Grid>
                                    
                                    {/* Correction proposée */}
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
                                          Correction proposée:
                                        </MDTypography>
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
                                    </Grid>
                                    
                                    {/* Points forts et à améliorer pour cette tâche */}
                                    <Grid item xs={12}>
                                      <MDBox mt={3}>
                                        <Grid container spacing={3}>
                                          {/* Points forts */}
                                          <Grid item xs={12} md={6}>
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
                                                )) || (
                                                  <MDTypography variant="body2" color="text" textAlign="center">
                                                    Aucun point fort identifié.
                                                  </MDTypography>
                                                )}
                                              </List>
                                            </Card>
                                          </Grid>
                                          
                                          {/* Points à améliorer */}
                                          <Grid item xs={12} md={6}>
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
                                                )) || (
                                                  <MDTypography variant="body2" color="text" textAlign="center">
                                                    Aucun point d'amélioration identifié.
                                                  </MDTypography>
                                                )}
                                              </List>
                                            </Card>
                                          </Grid>
                                        </Grid>

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
                  </MDBox>
                </Grid>
                  
                {/* Informations */}
                <Grid item xs={12}>
                  <MDBox>
                    
                    <MDBox mb={4}>
                      <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                        <MDTypography variant="h4" fontWeight="bold" color="dark">
                          <Icon sx={{ mr: 2, verticalAlign: 'middle', color: '#3b82f6' }}>info</Icon>
                          Informations
                        </MDTypography>
                      </MDBox>
                      
                      <Card 
                        sx={{ 
                          p: 3, 
                          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                          borderRadius: 3,
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}
                      >
                        <MDTypography variant="body2" color="text" mb={2}>
                          Cette évaluation est basée sur les critères du TCF Canada. Chaque tâche a été évaluée individuellement avec des points forts et des points à améliorer spécifiques.
                        </MDTypography>
                        <MDTypography variant="body2" color="text">
                          Vous pouvez traduire les commentaires pour chaque tâche en utilisant le bouton "Traduire" disponible dans chaque section.
                        </MDTypography>
                      </Card>
                    </MDBox>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </DialogContent>
          
          <DialogActions
            sx={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              p: 3,
              justifyContent: 'center',
              borderTop: '1px solid #e2e8f0',
              gap: 2
            }}
          >
            <MDButton
              variant="gradient"
              color="info"
              size="large"
              onClick={() => navigate('/simulateur-tcf-canada/expression-ecrits')}
              sx={{
                background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(0, 131, 176, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(0, 131, 176, 0.4)'
                }
              }}
            >
              <Icon sx={{ mr: 1 }}>arrow_back</Icon>
              Retour aux exercices
            </MDButton>
            
            <MDButton
              variant="gradient"
              color="success"
              size="large"
              onClick={() => window.open('https://reussir-tcfcanada.com/expression-ecrite/', '_blank')}
              sx={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)'
                }
              }}
            >
              <Icon sx={{ mr: 1 }}>article</Icon>
              Sujet d'actualité d'expression écrite
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      
      {/* Modal de traduction */}
      {renderTranslationModal()}
    </>
  );
}

export default TCFResultsInterface;