/**
=========================================================
* Interface d'Examen TCF Canada - v2.2.0
=========================================================
*/

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useInfoUser } from "context/InfoUserContext";

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
  const { userInfo, loadUserInfo } = useInfoUser();

  // États principaux
  const [subject, setSubject] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  const [showCharacterTable, setShowCharacterTable] = useState(true);
  const [showRetakeDialog, setShowRetakeDialog] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [fullscreenDocument, setFullscreenDocument] = useState(null);
  
  // Caractères spéciaux disponibles
  const specialCharacters = [
    ['à', 'À', 'â', 'Â', 'ç', 'Ç'],
    ['é', 'É', 'è', 'È', 'ê', 'Ê'],
    ['ë', 'Ë', 'î', 'Î', 'ï', 'Ï'],
    ['ô', 'Ô', 'ù', 'Ù', 'û', 'Û'],
    ['œ', 'æ', "'", '"', '(', ')'],
    [',', '-', '.', ':', ';', '?'],
    ['!', '…', '', '', '', '']
  ];
  


  // Chargement du sujet et des informations utilisateur
  useEffect(() => {
          // Check for isRetake parameter in URL
          const query = new URLSearchParams(location.search);
          const isRetake = query.get('isRetake') === 'true';
  
          if (isRetake) {
            // Empêcher l'utilisateur de revenir en arrière avec le bouton du navigateur
            window.history.pushState(null, document.title, window.location.href);
            window.addEventListener('popstate', function(event) {
              window.history.pushState(null, document.title, window.location.href);
            });
            
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
        
        // Les informations utilisateur sont déjà disponibles via le contexte

  
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

  // Nettoyer 'examStarted' lors du démontage du composant
  useEffect(() => {
    return () => {
      // Nettoyer 'examStarted' uniquement si on quitte vraiment la page d'examen
      // et non pas lors d'un refresh ou d'une navigation interne
      localStorage.removeItem('examStarted');
    };
  }, []);

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
      // Utiliser les informations utilisateur du contexte

      if (userInfo) {
        const currentSold = userInfo.sold;
        
        // Vérifier si l'utilisateur a suffisamment de crédits
        if (currentSold > 0) {
         
          // Décrémenter le solde de 1
          const newSold = currentSold - 1;
          console.log(newSold)
          // Mettre à jour le solde dans le backend via API
          await authService.updateSold(userInfo.username, newSold);
          
          // Recharger les informations utilisateur pour synchroniser
          await loadUserInfo(true);
          
          // Empêcher l'utilisateur de revenir en arrière avec le bouton du navigateur
          window.history.pushState(null, document.title, window.location.href);
          window.addEventListener('popstate', function(event) {
            window.history.pushState(null, document.title, window.location.href);
          });
          
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
      
      // Empêcher l'utilisateur de revenir en arrière avec le bouton du navigateur
      window.history.pushState(null, document.title, window.location.href);
      window.addEventListener('popstate', function(event) {
        window.history.pushState(null, document.title, window.location.href);
      });
      
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



  // Limites de mots par tâche
  const getWordLimits = (taskIndex) => {
    const limits = {
      0: { min: 60, max: 120 },   // Tâche 1
      1: { min: 120, max: 150 },  // Tâche 2
      2: { min: 120, max: 180 }   // Tâche 3
    };
    return limits[taskIndex] || { min: 0, max: 999 };
  };

  // Compteur de mots amélioré
  const getWordCount = (taskIndex = currentTaskIndex) => {
    const currentResponse = responses[taskIndex] || '';
    // Supprimer les balises HTML et compter les mots
    const textOnly = currentResponse.replace(/<[^>]*>/g, '');
    const words = textOnly.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const limits = getWordLimits(taskIndex);
    
    return {
      count: wordCount,
      min: limits.min,
      max: limits.max,
      isValid: wordCount >= limits.min && wordCount <= limits.max,
      isUnderMin: wordCount < limits.min,
      isOverMax: wordCount > limits.max
    };
  };

  // Validation des contraintes de mots
  const isWordCountValid = (taskIndex = currentTaskIndex) => {
    return getWordCount(taskIndex).isValid;
  };

  // Validation globale des trois conditions pour la soumission
  const validateAllConditions = () => {
    const validationResult = {
      isValid: true,
      errors: []
    };

    // Condition 1: Vérifier que toutes les tâches ont une réponse (non vide)
    for (let i = 0; i < subject.tasks.length; i++) {
      const response = responses[i] || '';
      const cleanResponse = response.replace(/<[^>]*>/g, '').trim();
      
      if (!cleanResponse || cleanResponse.length === 0) {
        validationResult.isValid = false;
        validationResult.errors.push(`Tâche ${i + 1}: Aucune réponse fournie`);
      }
    }

    // Condition 2: Vérifier que toutes les tâches respectent les limites de mots
    for (let i = 0; i < subject.tasks.length; i++) {
      const wordCountData = getWordCount(i);
      if (!wordCountData.isValid) {
        validationResult.isValid = false;
        if (wordCountData.isUnderMin) {
          validationResult.errors.push(`Tâche ${i + 1}: Nombre de mots insuffisant (${wordCountData.count}/${wordCountData.min} minimum)`);
        } else if (wordCountData.isOverMax) {
          validationResult.errors.push(`Tâche ${i + 1}: Nombre de mots dépassé (${wordCountData.count}/${wordCountData.max} maximum)`);
        }
      }
    }

    // Condition 3: Vérifier que chaque réponse contient un contenu substantiel
    for (let i = 0; i < subject.tasks.length; i++) {
      const response = responses[i] || '';
      const cleanResponse = response.replace(/<[^>]*>/g, '').trim();
      const words = cleanResponse.split(/\s+/).filter(word => word.length > 0);
      
      // Vérifier qu'il y a au moins 3 mots significatifs
      if (words.length > 0 && words.length < 3) {
        validationResult.isValid = false;
        validationResult.errors.push(`Tâche ${i + 1}: Contenu insuffisant (au moins 3 mots requis)`);
      }
    }

    return validationResult;
  };

  // Vérifier si la soumission est possible
  const canSubmitExam = () => {
    return validateAllConditions().isValid;
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

  // Gestion du mode plein écran pour les documents
  const openFullscreenDocument = (docIndex, docContent) => {
    setFullscreenDocument({ index: docIndex, content: docContent });
  };

  const closeFullscreenDocument = () => {
    setFullscreenDocument(null);
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
          background: 'linear-gradient(135deg, #a8e6cf 0%, #88d8c0 25%, #7fcdcd 50%, #81c7d4 75%, #88c5db 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          pl:25
        }}
      >
        <Fade in timeout={1200}>
          <Card 
            sx={{ 
              maxWidth: 900, 
              p: 6, 
              paddingX: 8,
              textAlign: 'center',
              borderRadius: 24,
              boxShadow: '0 32px 64px rgba(0,0,0,0.12), 0 16px 32px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              position: 'relative',
              maxHeight: '85vh',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '6px',
                background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', 
              }}
            />
            
            <MDBox mb={2} mt={1}>
              <Avatar 
                sx={{ 
                  width: 70, 
                  height: 70, 
                    background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', 
                  margin: '0 auto 12px',
                  boxShadow: '0 8px 16px rgba(102, 126, 234, 0.25)'
                }}
              >
                <Icon style={{fontSize: '32px !important'}} sx={{  color: 'white' }}>LibraryBooksOutlined</Icon>
              </Avatar>
              <MDTypography variant="h3" fontWeight="700" color="dark" mb={1} sx={{ fontSize: '2rem' }}>
                {subject.name}
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={1} sx={{ fontWeight: 500, opacity: 0.8, fontSize: '0.95rem' }}>
                Durée: {subject.duration} minutes • {subject.tasks.length} tâches d'expression
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={1.5} sx={{ fontSize: '0.9rem', opacity: 0.7 }}>
                Ce test simule l'examen réel du TCF Canada.
              </MDTypography>
                
            </MDBox>
            
            <Divider sx={{ my: 1.5, opacity: 0.3 }} />
            
            <MDBox mb={2}>
             
              {/* Instructions des tâches - Dynamiques */}
             
              
              <MDTypography variant="h5" color="dark" mb={2} fontWeight="600" sx={{ fontSize: '1.3rem' }}>
              Instructions importantes
              </MDTypography>
              
              {/* Instructions importantes */}
              <MDBox mb={2}>
                <MDBox display="flex" alignItems="center" mb={1.5} sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Avatar sx={{ width: 32, height: 32,   background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', mr: 2 }}>
                    <Icon sx={{ fontSize: 18, color: 'white' }}>menu_book</Icon>
                  </Avatar>
                  <MDTypography variant="body1" color="dark" fontWeight="500" sx={{ fontSize: '1rem' }}>
                    Lisez et planifiez chaque tâche
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" mb={1.5} sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Avatar sx={{ width: 32, height: 32,   background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', mr: 2 }}>
                    <Icon sx={{ fontSize: 18, color: 'white' }}>save</Icon>
                  </Avatar>
                  <MDTypography variant="body1" color="dark" fontWeight="500" sx={{ fontSize: '1rem' }}>
                    Sauvegarde automatique activée
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" mb={1.5} sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Avatar sx={{ width: 32, height: 32,   background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', mr: 2 }}>
                    <Icon sx={{ fontSize: 18, color: 'white' }}>timer</Icon>
                  </Avatar>
                  <MDTypography variant="body1" color="dark" fontWeight="500" sx={{ fontSize: '1rem' }}>
                    Timer démarrera au clic
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" mb={1} sx={{ 
                  p: 1.5, 
                  borderRadius: 3, 
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}>
                  <Avatar sx={{ width: 32, height: 32,   background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)', mr: 2 }}>
                    <Icon sx={{ fontSize: 18, color: 'white' }}>swap_horiz</Icon>
                  </Avatar>
                  <MDTypography variant="body1" color="dark" fontWeight="500" sx={{ fontSize: '1rem' }}>
                    Navigation libre entre tâches
                  </MDTypography>
                </MDBox>
              </MDBox>
              
          
            </MDBox>
            
            <MDBox mt={1} mb={2}>
              <MDButton 
                variant="contained" 
                color="info" 
                size="large"
                onClick={handleStartExam}
                fullWidth
                sx={{ 
                  px: 6, 
                  py: 2.5,
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
                  boxShadow: '0 16px 32px rgba(249, 250, 251, 0.79)',
                  transition: 'all 0.3s ease',
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 10,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
                    boxShadow: '0 20px 40px rgba(249, 250, 251, 0.79)',
                    transform: 'translateY(-3px) scale(1.02)'
                  }
                }}
              >
                <Icon sx={{ mr: 1.5, color: 'white', fontSize: '1.5rem' }}>play_arrow</Icon>
                <span style={{ color: 'white' }}>COMMENCER LE COACHING</span>
              </MDButton>
            </MDBox>
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
        p: 2,
        gap: 2
      }}
    >
      {/* Panneau latéral gauche - Navigation des tâches */}
      <MDBox 
        sx={{
          width: '200px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {subject.tasks.map((task, index) => (
          <MDBox
            key={index}
            onClick={() => setCurrentTaskIndex(index)}
            sx={{
              backgroundColor: currentTaskIndex === index ? '#E0F3FC' : 'rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              p: 2,
              cursor: 'pointer',
              border: currentTaskIndex === index ? '2px solid #4dd0e1' : '1px solid rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: currentTaskIndex === index ? '#E0F3FC' : 'rgba(255, 255, 255, 0.5)'
              }
            }}
          >
            <MDTypography 
              variant="h5" 
              fontWeight="bold" 
              color="#2C3E50"
              sx={{ fontSize: '1.2rem', textAlign: 'center' }}
            >
              Tâche {index + 1}
            </MDTypography>
           
          </MDBox>
        ))}
      </MDBox>

      {/* Zone centrale principale */}
      <MDBox
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Zone d'instruction de la tâche */}
        <MDBox
          sx={{
            backgroundColor: '#E0F3FC',
            borderRadius: '15px',
            p: 2,
            color: '#2C3E50',
            maxHeight: '30vh', // Limite la hauteur maximale
            overflowY: 'auto', // Ajoute un défilement vertical
            marginBottom: 2 // Ajoute une marge en bas
          }}
        >
          <MDTypography variant="h5" fontWeight="bold" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ color: '#2C3E50', transform: 'rotate(45deg)', fontSize:'22px !important' }}>push_pin</Icon>
            Tâche {currentTaskIndex + 1}: 
          </MDTypography>
           <MDTypography   mb={2}  ml={3}>
          <div style={{ display: 'inline',  marginBottom: '8px' }} dangerouslySetInnerHTML={{ __html: `<small><i>Consigne :     ${currentTask.instructions?.replace(/<p>/g, '<span>').replace(/<\/p>/g, '</span>').replace(/\n/g, ' </i></small>')}` }} />
        </MDTypography>
          <MDTypography variant="h5" fontWeight="bold" mb={1}>
            
     {currentTask.title && (
              <div dangerouslySetInnerHTML={{ __html: currentTask.title }} />
            )}     </MDTypography>
          <MDTypography variant="body1" sx={{ 
            lineHeight: 1.4, 
            fontSize: '0.95rem'
          }}>
            <div style={{ marginLeft: '12px' }} dangerouslySetInnerHTML={{ __html: currentTask.description }} />
          </MDTypography>
          {currentTask.structure && (
            <MDBox mt={1}>
              <div style={{ marginLeft: '12px' }} dangerouslySetInnerHTML={{ __html: currentTask.structure }} />
            </MDBox>
          )}
          {currentTask.documents && currentTask.documents.length > 0 && (
          <MDBox 
              sx={{
                display: 'flex', 
                flexDirection: currentTaskIndex === 2 ? 'row' : 'column',
                gap: 2,
                flexWrap: 'wrap'
              }}
            >
              {currentTask.documents.map((doc, index) => (
                <MDBox 
                  key={index} 
                  sx={{
                    flex: currentTaskIndex === 2 ? '1 1 45%' : '1 1 100%',
                    minWidth: currentTaskIndex === 2 ? '250px' : 'auto',
                    mb: currentTaskIndex !== 2 ? 2 : 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '8px',
                    p: 1.5,
                    position: 'relative'
                  }}
                >
                  {/* Icône d'agrandissement en haut à droite */}
                  <Tooltip title="Afficher en plein écran" placement="top">
                    <Icon
                      onClick={() => openFullscreenDocument(index, doc.content)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 20,
                       
                        fontSize: '34px',
                        color: '#2C3E50',
                        cursor: 'pointer',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        
                       
                        '&:hover': {
                          backgroundColor: 'rgba(79, 204, 231, 0.1)',
                          color: '#4FCCE7',
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      zoom_in
                    </Icon>
                  </Tooltip>
                  
                  <MDTypography variant="subtitle2" color="#2C3E50" fontWeight="bold" mb={1}>
                    Document {index + 1}
                  </MDTypography>
                  <MDTypography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                    <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                  </MDTypography>
                  {currentTaskIndex !== 2 && index < currentTask.documents.length - 1 && <Divider sx={{ my: 2 }} />}
                </MDBox>
              ))}
            </MDBox>

)}

        </MDBox>

     

        {/* Zone de réponse */}
        <MDBox
          sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.79)',
            borderRadius: '15px',
            p: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '42vh',
            position: 'sticky', // Fixe la position
            bottom: 0, // Colle au bas de l'écran
            zIndex: 2 // S'assure qu'il reste au-dessus des autres éléments
          }}
        >
          <MDTypography variant="h6" color="#2C3E50" mb={2} sx={{ textAlign: 'center' }}>
            Zone de réponse
          </MDTypography>
          <MDBox sx={{ position: 'relative', flex: 1 }}>
            <textarea
              ref={textareaRef}
              value={responses[currentTaskIndex] || ''}
              onChange={(e) => handleResponseChange(e.target.value)}
              placeholder="Commencez à écrire votre réponse ici..."
              style={{
                width: '100%',
                height: '100%',
                fontSize: '14px',
                lineHeight: '1.5',
                padding: '16px',
                paddingBottom: '40px', // Espace pour l'indicateur de mots
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                minHeight: '50vh'
              }}
            />
            {/* Indicateur de mots en bas à droite */}
            <MDBox
              sx={{
                position: 'absolute',
                bottom: '8px',
                right: '16px',
                backgroundColor: getWordCount().isOverMax ? '#ffebee' : getWordCount().isUnderMin ? '#fff3e0' : '#e8f5e8',
                color: getWordCount().isOverMax ? '#d32f2f' : getWordCount().isUnderMin ? '#f57c00' : '#2e7d32',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                border: `1px solid ${getWordCount().isOverMax ? '#ffcdd2' : getWordCount().isUnderMin ? '#ffcc02' : '#c8e6c9'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {getWordCount().count}/{getWordCount().max}
            </MDBox>
          </MDBox>
          
          {/* Boutons d'action */}
          <MDBox sx={{ display: 'flex', justifyContent: currentTaskIndex === subject.tasks.length - 1 ? 'center' : 'space-between', mt: 2 }}>
            {/* Afficher le bouton Enregistrer seulement si ce n'est pas la dernière tâche */}
            {currentTaskIndex !== subject.tasks.length - 1 && (
              <MDButton
              variant="contained"
              onClick={handleSaveResponse}
              disabled={!isWordCountValid()}
              style={{color: 'white'}}
              sx={{
                backgroundColor: isWordCountValid() ? '#2ECC71' : '#bdbdbd',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: isWordCountValid() ? '#27AE60' : '#bdbdbd'
                },
                '&:disabled': {
                  backgroundColor: '#bdbdbd',
                  color: '#ffffff'
                }
              }}
            >
              ENREGISTRER
            </MDButton>
            )}
            
            <MDButton
              variant="contained"
              onClick={handleSubmitExam}
              disabled={!canSubmitExam()}
              style={{color: 'white'}}
              sx={{
                backgroundColor: canSubmitExam() ? '#FF4E4E' : '#bdbdbd',
                color: 'white',
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: canSubmitExam() ? '#E74C3C' : '#bdbdbd'
                },
                '&:disabled': {
                  backgroundColor: '#bdbdbd',
                  color: '#ffffff'
                }
              }}
            >
              {currentTaskIndex === subject.tasks.length - 1 ? 'ENREGISTRER ET TERMINER' : 'TERMINER L\'EXAMEN'}
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>

      {/* Panneau latéral droit - Informations */}
      <MDBox 
        sx={{
          width: '250px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Info candidat */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.79)',
            borderRadius: '15px',
            p: 2,
            textAlign: 'center'
          }}
        >
          <MDTypography variant="h6" fontWeight="bold" color="#2C3E50" mb={1}>
            Info candidat
          </MDTypography>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mx: 'auto',
              mb: 1,
              backgroundColor: '#6A85B6'
            }}
          >
            <Icon>person</Icon>
          </Avatar>
          <MDTypography variant="body2" color="#2C3E50">
            {userInfo ? `${userInfo.prenom} ${userInfo.nom}` : 'XX XX'}
          </MDTypography>
        </MDBox>

        {/* Minuteur */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.79)',
            borderRadius: '15px',
            p: 3,
            textAlign: 'center'
          }}
        >
          <MDTypography 
            variant="h3" 
            fontWeight="bold" 
            color={timeRemaining < 300 ? "#FF4E4E" : "#2C3E50"}
            sx={{ 
              fontFamily: 'monospace',
              fontSize: '2rem'
            }}
          >
            {formatTime(timeRemaining)}
          </MDTypography>
        </MDBox>

        {/* Compteur de mots */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.79)',
            borderRadius: '15px',
            p: 2,
            textAlign: 'center'
          }}
        >
          <MDTypography variant="h6" color="#2C3E50" mb={1}>
            Mots: {getWordCount().count}
          </MDTypography>
          <MDTypography 
            variant="body2" 
            color={getWordCount().isValid ? "#2e7d32" : "#d32f2f"}
            fontWeight="bold"
          >
            Limite: {getWordCount().min}-{getWordCount().max} mots
          </MDTypography>
          {!getWordCount().isValid && (
            <MDTypography variant="caption" color="#d32f2f" display="block" mt={0.5}>
              {getWordCount().isUnderMin ? 'Nombre de mots insuffisant' : 'Nombre de mots dépassé'}
            </MDTypography>
          )}
        </MDBox>

        {/* Caractères spéciaux */}
        <MDBox 
          sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.79)',
            borderRadius: '15px',
            p: 2
          }}
        >
          <MDButton
            onClick={toggleCharacterTable}
            sx={{
              backgroundColor: 'transparent',
              color: '#2C3E50',
              fontWeight: 'bold',
              width: '100%',
              mb: showCharacterTable ? 1 : 0,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            CARACTÈRES SPÉCIAUX
          </MDButton>
          
          {showCharacterTable && (
            <MDBox>
              <MDTypography variant="caption" fontWeight="bold" mb={1} display="block" color="#2C3E50">
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
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        color: '#2C3E50',
                        fontSize: '14px',
                        fontWeight: 'normal',
                        borderRadius: '6px',
                        p: 0,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)'
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
              Vous avez droit à 1 tentative pour cet examen
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              Tentative actuelle: {attemptCount + 1} / 1
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
          <MDButton
            onClick={confirmRetakeExam}
            color="primary"
            variant="gradient"
            sx={({ palette: { gradients }, functions: { linearGradient } }) => ({
              backgroundImage: linearGradient(gradients.primaryToSecondary.main, gradients.primaryToSecondary.state),
              '&:hover': {
                backgroundColor: 'rgba(79, 204, 231, 1)',
                boxShadow: '0 4px 20px 0 rgba(79, 204, 231, 0.4)',
              },
            })}
          >
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
          
          {/* Afficher les erreurs de validation s'il y en a */}
          {(() => {
            const validation = validateAllConditions();
            if (!validation.isValid) {
              return (
                <MDBox mt={2} p={2} sx={{ backgroundColor: '#ffebee', borderRadius: '8px', border: '1px solid #f44336' }}>
                  <MDTypography variant="h6" color="error" mb={1}>
                    ⚠️ Conditions non respectées:
                  </MDTypography>
                  {validation.errors.map((error, index) => (
                    <MDTypography key={index} variant="body2" color="error" sx={{ mb: 0.5 }}>
                      • {error}
                    </MDTypography>
                  ))}
                  <MDTypography variant="caption" color="text" mt={1} display="block">
                    Veuillez corriger ces problèmes avant de soumettre.
                  </MDTypography>
                </MDBox>
              );
            }
            return null;
          })()}
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={() => setShowSubmitDialog(false)}
            color="primary"
            variant="gradient"
            sx={({ palette: { gradients }, functions: { linearGradient } }) => ({
              backgroundImage: linearGradient(gradients.primaryToSecondary.main, gradients.primaryToSecondary.state),
              '&:hover': {
                backgroundColor: 'rgba(79, 204, 231, 1)',
                boxShadow: '0 4px 20px 0 rgba(79, 204, 231, 0.4)',
              },
            })}
          >
            Continuer l'examen
          </MDButton>
          <MDButton
            onClick={confirmSubmitExam}
            disabled={!canSubmitExam()}
            color="primary"
            variant="gradient"
            sx={({ palette: { gradients }, functions: { linearGradient } }) => ({
              backgroundImage: canSubmitExam() 
                ? linearGradient(gradients.primaryToSecondary.main, gradients.primaryToSecondary.state)
                : 'linear-gradient(45deg, #bdbdbd, #9e9e9e)',
              '&:hover': {
                backgroundColor: canSubmitExam() ? 'rgba(79, 204, 231, 1)' : '#bdbdbd',
                boxShadow: canSubmitExam() ? '0 4px 20px 0 rgba(79, 204, 231, 0.4)' : 'none',
              },
              '&:disabled': {
                backgroundImage: 'linear-gradient(45deg, #bdbdbd, #9e9e9e)',
                color: '#ffffff',
                opacity: 0.6
              }
            })}
          >
            Soumettre définitivement
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de plein écran pour les documents */}
      <Dialog 
        open={!!fullscreenDocument} 
        onClose={closeFullscreenDocument}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '95vw',
            height: '95vh',
            maxWidth: 'none',
            maxHeight: 'none',
            margin: '2.5vh 2.5vw'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <MDTypography variant="h5" fontWeight="bold">
            Document {fullscreenDocument?.index + 1} - Affichage plein écran
          </MDTypography>
          <Tooltip title="Fermer" placement="left">
            <Icon
              onClick={closeFullscreenDocument}
              sx={{
                fontSize: '24px',
                color: '#666',
                cursor: 'pointer',
                
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  color: '#333'
                },
                transition: 'all 0.2s ease'
              }}
            >
              close
            </Icon>
          </Tooltip>
        </DialogTitle>
        <DialogContent sx={{ 
          padding: '24px',
          backgroundColor: '#fafafa',
          overflow: 'auto'
        }}>
          <MDBox sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minHeight: '70vh'
          }}>
            <MDTypography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.6, 
                fontSize: '1.1rem',
                color: '#333'
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: fullscreenDocument?.content }} />
            </MDTypography>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ 
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          padding: '16px 24px'
        }}>
          <MDButton
            onClick={closeFullscreenDocument}
            color="primary"
            variant="gradient"
            sx={({ palette: { gradients }, functions: { linearGradient } }) => ({
              backgroundImage: linearGradient(gradients.primaryToSecondary.main, gradients.primaryToSecondary.state),
              '&:hover': {
                backgroundColor: 'rgba(79, 204, 231, 1)',
                boxShadow: '0 4px 20px 0 rgba(79, 204, 231, 0.4)',
              },
            })}
          >
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>
    </MDBox>
  );
}
export default TCFExamInterface;
