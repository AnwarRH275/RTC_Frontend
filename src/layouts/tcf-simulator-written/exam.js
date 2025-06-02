/**
=========================================================
* Interface d'Examen TCF Canada - v2.2.0
=========================================================
*/

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import StepConnector from "@mui/material/StepConnector";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import Zoom from "@mui/material/Zoom";
import Paper from "@mui/material/Paper";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Container from "@mui/material/Container";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Services
import TCFAdminService from "services/tcfAdminService";
import authService from "services/authService";
import attemptService from "services/attemptService";

function TCFExamInterface() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef(null);
  const textareaRef = useRef(null);

  // États principaux
  const [subject, setSubject] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  const [userInfo, setUserInfo] = useState(null);
  const [showCharacterTable, setShowCharacterTable] = useState(true);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Caractères spéciaux disponibles
  const specialCharacters = [
    ['é', 'è', 'ê', 'ë', 'à', 'á'],
    ['â', 'ä','î', 'ï', 'ý', 'ÿ'],
    ['ù', 'ú', 'û', 'ü', 'ì', 'í'],
    ['ò', 'ó', 'ô', 'ö', 'ç', 'ñ'],
    ['œ', 'æ', 'ß', 'ø', '[', ']'],
    ["'", '"', '«', '»', '(', ')'],
    ['{', '}', '–', '—', '…', '°']
  ];
  


  // Chargement du sujet et des informations utilisateur
  useEffect(() => {
          // Check for isRetake parameter in URL
          const query = new URLSearchParams(location.search);
          const isRetake = query.get('isRetake') === 'true';
  
          if (isRetake) {
            setIsExamStarted(true);
            localStorage.setItem('examStarted', 'true');
          }
    const fetchSubject = async () => {
      try {
        const subjectData = await TCFAdminService.getSubjectById(subjectId);
        setSubject(subjectData);
        setTimeRemaining(subjectData.duration * 60); // Convertir en secondes
        
        // Charger les réponses sauvegardées ou initialiser des réponses vides
        const savedResponses = localStorage.getItem(`tcf-responses-${subjectId}`);
        if (savedResponses) {
          setResponses(JSON.parse(savedResponses));
        } else {
          const initialResponses = {};
          subjectData.tasks.forEach((task, index) => {
            initialResponses[index] = '';
          });
          setResponses(initialResponses);
        }
        
        // Charger les informations utilisateur depuis le localStorage
        const savedUserInfo = localStorage.getItem('user_info');
        if (savedUserInfo) {
          setUserInfo(JSON.parse(savedUserInfo));
        }

  
      } catch (error) {
        console.error('Erreur lors du chargement du sujet:', error);
        navigate('/tcf-simulator/written');
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId, navigate]);

  // Timer
  useEffect(() => {
    
    let interval;
    if (isExamStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            localStorage.removeItem('examStarted');
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isExamStarted, timeRemaining]);

  // Auto-sauvegarde des réponses dans localStorage
  useEffect(() => {
    if (isExamStarted && Object.keys(responses).length > 0) {
      setAutoSaveStatus('saving');
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
      
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [responses, isExamStarted, subjectId]);

  // Formatage du temps
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion des réponses avec sauvegarde automatique
  const handleResponseChange = (value) => {
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [currentTaskIndex]: value
      };
      // Sauvegarder immédiatement dans localStorage
      localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(newResponses));
      return newResponses;
    });
  };

  // Navigation entre tâches avec sauvegarde
  const handleNextTask = () => {
    if (currentTaskIndex < subject.tasks.length - 1) {
      // Sauvegarder avant de changer de tâche
      localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      // Sauvegarder avant de changer de tâche
      localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
      setCurrentTaskIndex(prev => prev - 1);
    }
  };

  const handleTaskSelect = (index) => {
    // Sauvegarder avant de changer de tâche
    localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
    setCurrentTaskIndex(index);
  };

  const handleSaveResponse = () => {
    // La sauvegarde est déjà gérée par handleResponseChange via useEffect
    // et par les navigations handleNextTask, handlePreviousTask, handleTaskSelect.
    // Cette fonction peut être utilisée pour déclencher une sauvegarde manuelle si nécessaire
    // ou pour afficher une confirmation à l'utilisateur.
    // Pour l'instant, nous allons juste forcer une mise à jour de l'état de sauvegarde.
    setAutoSaveStatus('saving');
    localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
    setTimeout(() => {
      setAutoSaveStatus('saved');
      if (currentTaskIndex === subject.tasks.length - 1) {
        handleSubmitExam(); // Terminer l'examen si c'est la dernière tâche
      } else {
        handleNextTask(); // Passer à la tâche suivante
      }
    }, 500); // Attendre un court instant pour que l'état 'saved' soit visible
  };

  // Démarrage de l'examen
  const handleStartExam = async () => {
    try {
      // Récupérer les informations utilisateur depuis localStorage
      const userInfoString = localStorage.getItem('user_info');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        const currentSold = userInfo.sold;
        
        // Vérifier si l'utilisateur a suffisamment de crédits
        if (currentSold > 0) {
          // Décrémenter le solde de 1
          const newSold = currentSold - 1;
          
          // Mettre à jour le solde dans localStorage
          userInfo.sold = newSold;
          localStorage.setItem('user_info', JSON.stringify(userInfo));
          
          // Mettre à jour le solde dans le backend via API
          await authService.updateSold(userInfo.username, newSold);
          
          // Démarrer l'examen
          setIsExamStarted(true);
          localStorage.setItem('examStarted', 'true');
        } else {
          // Afficher un message d'erreur si pas assez de crédits
          alert('Vous n\'avez pas suffisamment de crédits pour commencer cet examen.');
        }
      } else {
        alert('Erreur: Informations utilisateur non trouvées.');
      }
    } catch (error) {
       console.error('Erreur lors de la mise à jour du solde:', error);
       alert('Erreur lors du démarrage de l\'examen. Veuillez réessayer.');
     }
   };



  // Confirmer la reprise d'examen
  const confirmRetakeExam = async () => {
    try {
      // Incrémenter le compteur de tentatives
      await attemptService.incrementAttempt(subjectId);
      
      // Fermer le dialog
      setShowRetakeDialog(false);
      
      // Démarrer l'examen sans affecter le solde
      setIsExamStarted(true);
      localStorage.setItem('examStarted', 'true');
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des tentatives:', error);
      alert('Erreur lors du démarrage de l\'examen. Veuillez réessayer.');
    }
  };

  // Soumission de l'examen
  const handleSubmitExam = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmitExam = () => {
    // Sauvegarder les réponses dans le localStorage
    localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
    
    // Arrêter l'examen (supprimer l'état du localStorage)
    localStorage.removeItem('examStarted');
    
    // Rediriger vers la page de résultats
    navigate(`/simulateur-tcf-canada/expression-ecrits/results/${subjectId}`);
  };



  // Compteur de mots
  const getWordCount = () => {
    const currentResponse = responses[currentTaskIndex] || '';
    // Supprimer les balises HTML et compter les mots
    const textOnly = currentResponse.replace(/<[^>]*>/g, '');
    const words = textOnly.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  // Insertion de caractères spéciaux
  const insertSpecialCharacter = (character) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = responses[currentTaskIndex] || '';
      const newValue = currentValue.substring(0, start) + character + currentValue.substring(end);
      
      // Update the state
      setResponses(prev => ({
        ...prev,
        [currentTaskIndex]: newValue
      }));

      // Set the cursor position after insertion
      // Need a slight delay to ensure state update is reflected in the DOM
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + character.length;
        textarea.focus();
      }, 0);
    }
  };

  // Basculer l'affichage du tableau de caractères
  const toggleCharacterTable = () => {
    setShowCharacterTable(!showCharacterTable);
  };

  if (!subject) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <MDTypography variant="h6">Chargement de l'examen...</MDTypography>
      </MDBox>
    );
  }

  if (!isExamStarted) {
    return (
      <MDBox 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          pl:25
        }}
      >
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              maxWidth: 600, 
              p: 4, 
              textAlign: 'center',
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '8px',
                background: 'linear-gradient(90deg, #3b82f6, #10b981, #f59e0b)'
              }}
            />
            
            <MDBox mb={4} mt={1}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  backgroundColor: '#3b82f6', 
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)'
                }}
              >
                <Icon sx={{ fontSize: 40, color: 'white' }}>quiz</Icon>
              </Avatar>
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
                {subject.name}
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={2}>
                Durée: {subject.duration} minutes • {subject.tasks.length} tâches
              </MDTypography>
              <Chip 
                label={subject.plans} 
                sx={{ 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  fontWeight: 'bold',
                  borderRadius: '12px',
                  padding: '4px 8px'
                }}
              />
            </MDBox>
            
            <Divider sx={{ my: 3 }} />
            
            <MDBox mb={4}>
              <MDTypography variant="h6" color="dark" mb={2} fontWeight="bold">
                Instructions importantes:
              </MDTypography>
              <Paper elevation={0} sx={{ backgroundColor: '#f8fafc', p: 2, borderRadius: 3 }}>
                <MDBox textAlign="left">
                  <MDTypography variant="body2" color="text" mb={1} display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 16, mr: 1, color: '#3b82f6' }}>check_circle</Icon>
                    Lisez attentivement chaque tâche avant de commencer
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={1} display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 16, mr: 1, color: '#3b82f6' }}>check_circle</Icon>
                    Vos réponses sont automatiquement sauvegardées
                  </MDTypography>
                  <MDTypography variant="body2" color="text" mb={1} display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 16, mr: 1, color: '#3b82f6' }}>check_circle</Icon>
                    Le timer démarre dès que vous cliquez sur "Commencer"
                  </MDTypography>
                  <MDTypography variant="body2" color="text" display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 16, mr: 1, color: '#3b82f6' }}>check_circle</Icon>
                    Vous pouvez naviguer entre les tâches à tout moment
                  </MDTypography>
                </MDBox>
              </Paper>
            </MDBox>
            
            <MDButton 
              variant="contained" 
              color="info" 
              size="large"
              onClick={handleStartExam}
              sx={{ 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 12,
                backgroundColor: '#3b82f6',
                boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
                '&:hover': {
                  backgroundColor: '#2563eb',
                  boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                }
              }}
            >
              <Icon sx={{ mr: 1 }}>play_arrow</Icon>
              Commencer l'examen
            </MDButton>
          </Card>
        </Fade>
      </MDBox>
    );
  }

  const currentTask = subject.tasks[currentTaskIndex];

  return (
    <MDBox 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 25%, #7fcdcd 50%, #81c7d4 75%, #88c5db 100%)',
        display: 'flex',
        flexDirection: 'row',
        p: 0,
        m: 0
      }}
    >
      {/* Barre latérale gauche - Navigation des tâches */}
      <MDBox 
        sx={{
          width: '200px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 1
        }}
      >
        {subject.tasks.map((task, index) => {
          const isCompleted = responses[index]?.trim().length > 0;
          const isCurrent = index === currentTaskIndex;
          return (
            <MDButton
              key={index}
              onClick={() => handleTaskSelect(index)}
              sx={{
                backgroundColor: isCurrent ? '#4dd0e1' : 'rgba(255, 255, 255, 0.2)',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                borderRadius: '8px',
                p: 1.5,
                textAlign: 'left',
                justifyContent: 'flex-start',
                border: isCurrent ? '2px solid #00acc1' : '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: '#4dd0e1',
                  transform: 'translateX(5px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              TACHE {index + 1}
              {isCompleted && (
                <Icon sx={{ ml: 'auto', fontSize: '16px', color: '#00695c' }}>check_circle</Icon>
              )}
            </MDButton>
          );
        })}
      </MDBox>

      {/* Zone centrale */}
      <MDBox 
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          gap: 2
        }}
      >
        {/* Zone d'instruction */}
        <MDBox 
          sx={{
            backgroundColor: '#4dd0e1',
            borderRadius: '20px',
            p: 3,
            border: '2px solid #00acc1',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {currentTask.title && (
     
               <div 
         
               >
               <h3>  Tache {currentTaskIndex + 1} : </h3>
                 <p dangerouslySetInnerHTML={{ __html: currentTask.title }} />
                 <p dangerouslySetInnerHTML={{ __html: currentTask.structure }} />
               </div>
         
           )}
        </MDBox>

        {/* Zone des documents - Nouvelle section */}
        {currentTask.documents && currentTask.documents.length > 0 && (
          <MDBox 
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px',
              p: 3,
              border: '2px solid rgba(255, 255, 255, 0.5)',
              minHeight: '150px',
            }}
          >
            <MDTypography 
              variant="h6" 
              fontWeight="bold" 
              color="dark"
              textAlign="center"
              mb={3}
            >
              Documents de référence
            </MDTypography>
            
            <Grid container spacing={2}>
              {currentTask.documents.map((document, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      borderRadius: '12px',
                      height: '250px',
                      overflow: 'auto',
                      border: '1px solid #e0e0e0',
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    <MDTypography variant="subtitle1" fontWeight="bold" mb={1}>
                      Document {index + 1}
                    </MDTypography>
                    <MDBox 
                      sx={{ 
                        p: 1, 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        border: '1px solid #eee',
                        height: 'calc(100% - 40px)',
                        overflow: 'auto'
                      }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: document.content }} />
                    </MDBox>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}

        {/* Zone de réponse */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            p: 3,
            border: '2px solid rgba(255, 255, 255, 0.5)',
            flex: 1,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <MDTypography 
            variant="h6" 
            fontWeight="bold" 
            color="dark"
            textAlign="center"
            mb={3}
          >
            Zone de réponse
          </MDTypography>
          
          {/* Zone de saisie */}
          <Paper elevation={0} sx={{ p: 1, border: '1px solid #e2e8f0', borderRadius: '12px', flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={responses[currentTaskIndex] || ''}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Commencez à écrire votre réponse ici..."
              style={{
                height: 'calc(100% - 40px)',
                minHeight: '100%',
                width: '100%',
                fontSize: '16px',
                boxSizing: 'border-box',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px',
                resize: 'vertical'
              }}
            />
          </Paper>
          <MDBox sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>


            <MDButton
              variant="contained"
              color="success"
              onClick={handleSaveResponse}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '12px',
                backgroundColor: '#10b981',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  backgroundColor: '#059669',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                },
              }}
            >
              {currentTaskIndex === subject.tasks.length - 1 ? 'Enregistrer et Terminer' : 'Enregistrer'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>

      {/* Barre latérale droite - Informations */}
      <MDBox 
        sx={{
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          gap: 2
        }}
      >
        {/* Info candidat */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            p: 2,
            textAlign: 'center',
            marginBottom: '20px' // Add margin-bottom to separate from the next block
          }}
        >
          <MDTypography variant="h6" fontWeight="bold" color="dark">
            Info candidat
          </MDTypography>
          <MDTypography variant="body2" color="dark">
            {userInfo ? `${userInfo.prenom} ${userInfo.nom}` : 'Chargement...'}
          </MDTypography>
        </MDBox>

        {/* Minuteur */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            p: 2,
            textAlign: 'center',
            marginBottom: '20px' // Add margin-bottom to separate from the next block
          }}
        >
          <Icon fontSize="large" color="dark">timer</Icon>
          <MDTypography 
            variant="h3" 
            fontWeight="bold" 
            color={timeRemaining < 300 ? "error" : "dark"}
            sx={{ 
              fontFamily: 'monospace',
              textAlign: 'center'
            }}
          >
            {formatTime(timeRemaining)}
          </MDTypography>
        </MDBox>

        {/* Outils */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '15px',
            p: 2,
            border: '2px solid rgba(255, 255, 255, 0.5)',
            marginBottom: '20px' // Add margin-bottom to separate from the next block
          }}
        >
          {/* Compteur de mots */}
          <Card
            sx={{
              backgroundColor: '#4dd0e1',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '15px',
              p: 2,
              textAlign: 'center',
              mb: 2 // Add margin-bottom to separate from special characters
            }}
          >
            <MDTypography variant="h6" fontWeight="bold">
              Mots: {getWordCount()}
            </MDTypography>
          </Card>
          
          {/* Caractères spéciaux */}
          <MDButton
            onClick={toggleCharacterTable}
            sx={{
              backgroundColor: showCharacterTable ? '#26c6da' : '#4dd0e1',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '10px',
              width: '100%',
              mb: showCharacterTable ? 1 : 0,
              '&:hover': {
                backgroundColor: '#26c6da'
              }
            }}
          >
            Caractères spéciaux
          </MDButton>
          
          {/* Tableau de caractères spéciaux */}
          {showCharacterTable && (
            <MDBox 
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '10px',
                p: 1,
                border: '1px solid #e0e0e0'
              }}
            >
              <MDTypography variant="caption" fontWeight="bold" mb={1} display="block">
                Tableau de Caractères
              </MDTypography>
              {specialCharacters.map((row, rowIndex) => (
                <MDBox key={rowIndex} sx={{ display: 'flex', gap: 0.5, mb: 0.5, justifyContent: 'center' }}>
                  {row.map((char, charIndex) => (
                    <MDButton
                      key={charIndex}
                      onClick={() => insertSpecialCharacter(char)}
                      sx={{
                        minWidth: '30px',
                        height: '30px',
                        backgroundColor: '#f5f5f5',
                        color: '#000',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '6px',
                        p: 0,
                        '&:hover': {
                          backgroundColor: '#e0e0e0'
                        }
                      }}
                    >
                      {char}
                    </MDButton>
                  ))}
                </MDBox>
              ))}
            </MDBox>
          )}
        </MDBox>

        {/* Bouton Terminer */}
        <MDButton 
          variant="contained" 
          color="error" 
          onClick={handleSubmitExam}
          sx={{ 
            borderRadius: '12px',
            p: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            width: '100%',
            marginTop: 'auto',
            marginBottom: '30px'
          }}
        >
          <Icon sx={{ mr: 1 }}>send</Icon>
          Terminer l'examen
        </MDButton>
      </MDBox>

      {/* Dialog de confirmation pour les tentatives */}
      <Dialog open={showRetakeDialog} onClose={() => setShowRetakeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold" color="info">
            Information sur les tentatives
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDBox textAlign="center" py={2}>
            <Icon sx={{ fontSize: 60, color: '#3b82f6', mb: 2 }}>info</Icon>
            <MDTypography variant="h6" mb={2}>
              Vous avez droit à 2 tentatives pour cet examen
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              Tentative actuelle: {attemptCount + 1} / 2
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Cette tentative ne déduira pas de crédit de votre solde.
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowRetakeDialog(false)} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={confirmRetakeExam} color="info" variant="gradient">
            Commencer la tentative
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation */}
      <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold">
            Confirmer la soumission
          </MDTypography>
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="body1" mb={2}>
            Êtes-vous sûr de vouloir soumettre votre examen ?
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Temps restant: {formatTime(timeRemaining)}
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Tâches complétées: {Object.values(responses).filter(r => r.trim().length > 0).length} sur {subject.tasks.length}
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={() => setShowSubmitDialog(false)} color="secondary">
            Continuer l'examen
          </MDButton>
          <MDButton onClick={confirmSubmitExam} color="error" variant="gradient">
            Soumettre définitivement
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
export default TCFExamInterface;
