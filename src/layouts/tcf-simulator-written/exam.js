/**
=========================================================
* Interface d'Examen TCF Canada - v2.2.0
=========================================================
*/

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function TCFExamInterface() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  
  // États principaux
  const [subject, setSubject] = useState(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');
  
  // Configuration ReactQuill
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet'
  ];

  // Chargement du sujet
  useEffect(() => {
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

  // Démarrage de l'examen
  const handleStartExam = () => {
    setIsExamStarted(true);
  };

  // Soumission de l'examen
  const handleSubmitExam = () => {
    setShowSubmitDialog(true);
  };

  const confirmSubmitExam = () => {
    // Sauvegarder les réponses dans le localStorage
    localStorage.setItem(`tcf-responses-${subjectId}`, JSON.stringify(responses));
    
    // Rediriger vers la page de résultats
    navigate(`/tcf-simulator/written/results/${subjectId}`);
  };

  // Calcul du progrès
  const getProgress = () => {
    const completedTasks = Object.values(responses).filter(response => response.trim().length > 0).length;
    return (completedTasks / subject?.tasks?.length || 0) * 100;
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
    <MDBox sx={{ minHeight: '100vh', backgroundColor: '#f0f5ff', display: 'flex', flexDirection: 'column', ml: 25 }}>
      {/* Header avec timer et progrès */}
      <MDBox 
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          backgroundColor: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          width: '100%'
        }}
      >
        <Container maxWidth="xl">
          <MDBox py={2}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={4}>
                <MDBox display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: '#3b82f6', mr: 2 }}>
                    <Icon>description</Icon>
                  </Avatar>
                  <MDBox>
                    <MDTypography variant="h6" fontWeight="bold" color="dark">
                      {subject.name}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Tâche {currentTaskIndex + 1} sur {subject.tasks.length}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MDBox textAlign="center">
                  <MDTypography 
                    variant="h4" 
                    fontWeight="bold" 
                    color={timeRemaining < 300 ? "error" : "info"}
                    sx={{ 
                      fontFamily: 'monospace',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: timeRemaining < 300 ? '#fee2e2' : '#eff6ff',
                      padding: '4px 16px',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Icon sx={{ mr: 1, color: timeRemaining < 300 ? '#ef4444' : '#3b82f6' }}>timer</Icon>
                    {formatTime(timeRemaining)}
                  </MDTypography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(1 - timeRemaining / (subject.duration * 60)) * 100}
                    sx={{ 
                      mt: 1, 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: timeRemaining < 300 ? '#ef4444' : '#3b82f6'
                      }
                    }}
                  />
                </MDBox>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <MDBox display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
                  <Tooltip title={autoSaveStatus === 'saving' ? 'Sauvegarde en cours...' : 'Toutes les modifications sont sauvegardées'}>
                    <Chip 
                      icon={<Icon>{autoSaveStatus === 'saving' ? 'sync' : 'check_circle'}</Icon>}
                      label={autoSaveStatus === 'saving' ? 'Sauvegarde...' : 'Sauvegardé'}
                      color={autoSaveStatus === 'saving' ? 'warning' : 'success'}
                      size="small"
                      sx={{ borderRadius: '8px' }}
                    />
                  </Tooltip>
                  <MDButton 
                    variant="contained" 
                    color="error" 
                    size="small"
                    onClick={handleSubmitExam}
                    sx={{ 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <Icon sx={{ mr: 0.5 }}>send</Icon>
                    Terminer
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
            
            {/* Barre de progrès des tâches avec indicateurs */}
            <MDBox mt={2}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="body2" color="text">
                  Progrès: {Math.round(getProgress())}% complété
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {Object.values(responses).filter(r => r.trim().length > 0).length} sur {subject.tasks.length} tâches
                </MDTypography>
              </MDBox>
              <LinearProgress 
                variant="determinate" 
                value={getProgress()}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#10b981'
                  }
                }}
              />
              
              {/* Indicateurs de tâches */}
              <MDBox display="flex" justifyContent="space-between" mt={1}>
                {subject.tasks.map((task, index) => {
                  const isCompleted = responses[index]?.trim().length > 0;
                  const isCurrent = index === currentTaskIndex;
                  return (
                    <Tooltip key={index} title={`Tâche ${index + 1}${isCompleted ? ' - Complétée' : ''}`}>
                      <Badge
                        color={isCompleted ? 'success' : isCurrent ? 'info' : 'default'}
                        variant={isCurrent ? 'dot' : 'standard'}
                        overlap="circular"
                        badgeContent={isCompleted ? '✓' : ''}
                      >
                        <Avatar 
                          onClick={() => handleTaskSelect(index)}
                          sx={{ 
                            width: 28, 
                            height: 28, 
                            fontSize: '0.8rem',
                            bgcolor: isCompleted ? '#10b981' : isCurrent ? '#3b82f6' : '#e2e8f0',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </Badge>
                    </Tooltip>
                  );
                })}
              </MDBox>
            </MDBox>
          </MDBox>
        </Container>
      </MDBox>

      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        <Grid container spacing={3}>
          {/* Navigation des tâches */}
          <Grid item xs={12} lg={3}>
            <Card sx={{ 
              p: 2, 
              height: 'fit-content', 
              position: 'sticky', 
              top: 180,
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon sx={{ color: '#3b82f6', mr: 1 }}>navigation</Icon>
                <MDTypography variant="h6" fontWeight="bold" color="dark">
                  Navigation
                </MDTypography>
              </MDBox>
              
              <Stepper orientation="vertical" activeStep={currentTaskIndex} connector={<StepConnector sx={{ ml: '12px' }} />}>
                {subject.tasks.map((task, index) => {
                  const isCompleted = responses[index]?.trim().length > 0;
                  return (
                    <Step key={index} sx={{ cursor: 'pointer' }} onClick={() => handleTaskSelect(index)}>
                      <StepLabel 
                        sx={{ 
                          '& .MuiStepLabel-label': {
                            fontSize: '0.9rem',
                            fontWeight: index === currentTaskIndex ? 'bold' : 'normal',
                            color: index === currentTaskIndex ? '#3b82f6' : 'inherit'
                          }
                        }}
                        StepIconComponent={() => (
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: '1rem',
                              fontWeight: 'bold',
                           
                              backgroundColor: isCompleted ? '#10b981' : 
                                             index === currentTaskIndex ? '#3b82f6' : '#e2e8f0',
                              boxShadow: index === currentTaskIndex ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                            }}
                          >
                            {isCompleted ? '✓' : index + 1}
                          </Avatar>
                        )}
                      >
                        <MDBox display="flex" justifyContent="space-between" alignItems="center" width="100%">
                          <MDTypography variant="h6" fontWeight="bold" color="with">
                            Tâche {index + 1}
                          </MDTypography>
                          {isCompleted && (
                            <Chip 
                              label="Complétée" 
                              size="small" 
                              color="success" 
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          )}
                        </MDBox>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Card>
          </Grid>

          {/* Contenu principal */}
          <Grid item xs={12} lg={9}>
            <Zoom in timeout={500}>
              <Card sx={{ 
                p: 3, 
                minHeight: '70vh',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
              }}>
                {/* En-tête de la tâche */}
                <MDBox mb={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDBox display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: '#3b82f6', mr: 1.5 }}>
                        {currentTaskIndex + 1}
                      </Avatar>
                      <MDTypography variant="h5" fontWeight="bold" color="dark">
                        Tâche {currentTaskIndex + 1}
                      </MDTypography>
                    </MDBox>
                    <MDBox display="flex" gap={1}>
                      <Chip 
                        icon={<Icon fontSize="small">edit</Icon>}
                        label={`${responses[currentTaskIndex]?.length || 0} caractères`}
                        color="info"
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                      <Chip 
                        icon={<Icon fontSize="small">schedule</Icon>}
                        label={formatTime(timeRemaining)}
                        color={timeRemaining < 300 ? "error" : "default"}
                        size="small"
                        sx={{ borderRadius: '8px' }}
                      />
                    </MDBox>
                  </MDBox>
                  
                  {currentTask.title && (
                    <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8fafc', borderRadius: '12px', mb: 2 }}>
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentTask.title }}
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          color: '#1f2937',
                          marginBottom: '8px'
                        }}
                      />
                    </Paper>
                  )}
                  
                  {currentTask.structure && (
                    <MDBox mb={2}>
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentTask.structure }}
                        style={{
                          fontSize: '0.9rem',
                          color: '#6b7280',
                          fontStyle: 'italic',
                          padding: '8px 12px',
                          borderLeft: '3px solid #3b82f6',
                          backgroundColor: '#f0f5ff'
                        }}
                      />
                    </MDBox>
                  )}
                  
                  {currentTask.instructions && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mb: 2,
                        borderRadius: '12px',
                        '& .MuiAlert-icon': {
                          color: '#3b82f6'
                        }
                      }}
                      icon={<Icon>info</Icon>}
                    >
                      <div 
                        dangerouslySetInnerHTML={{ __html: currentTask.instructions }}
                        style={{
                          fontSize: '0.9rem',
                          lineHeight: '1.5'
                        }}
                      />
                    </Alert>
                  )}
                </MDBox>

                {/* Zone de saisie */}
                <MDBox>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ color: '#3b82f6', mr: 1 }}>create</Icon>
                    <MDTypography variant="h6" color="dark">
                      Votre réponse:
                    </MDTypography>
                  </MDBox>
                  
                  <Paper elevation={0} sx={{ p: 1, border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={responses[currentTaskIndex] || ''}
                      onChange={handleResponseChange}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Commencez à écrire votre réponse ici..."
                      style={{
                        height: '200px',
                        marginBottom: '50px',
                        borderRadius: '12px',
                        fontSize: '16px'
                      }}
                    />
                  </Paper>
                </MDBox>

                {/* Navigation */}
                <MDBox display="flex" justifyContent="space-between" mt={4}>
                  <MDButton
                    variant="outlined"
                    color="secondary"
                    onClick={handlePreviousTask}
                    disabled={currentTaskIndex === 0}
                    sx={{ 
                      borderRadius: '8px',
                      px: 3
                    }}
                  >
                    <Icon sx={{ mr: 1 }}>arrow_back</Icon>
                    Précédent
                  </MDButton>
                  
                  <MDButton
                    variant="contained"
                    color="info"
                    onClick={currentTaskIndex === subject.tasks.length - 1 ? handleSubmitExam : handleNextTask}
                    sx={{ 
                      borderRadius: '8px',
                      px: 3,
                      backgroundColor: currentTaskIndex === subject.tasks.length - 1 ? '#10b981' : '#3b82f6',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {currentTaskIndex === subject.tasks.length - 1 ? 'Terminer' : 'Suivant'}
                    <Icon sx={{ ml: 1 }}>
                      {currentTaskIndex === subject.tasks.length - 1 ? 'check' : 'arrow_forward'}
                    </Icon>
                  </MDButton>
                </MDBox>
              </Card>
            </Zoom>
          </Grid>
        </Grid>
      </Container>

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