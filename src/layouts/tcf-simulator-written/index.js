/**
=========================================================
* Simulateur TCF Canada React - v2.2.0
=========================================================
*/

import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";
import ReactMarkdown from 'react-markdown';

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import WrittenExpressionCard from "examples/Cards/TCFCards/WrittenExpressionCard";
import CompletedExpressionCard from "examples/Cards/TCFCards/CompletedExpressionCard";
import LockedExpressionCard from "examples/Cards/TCFCards/LockedExpressionCard";

// Services
import TCFAdminService from "services/tcfAdminService";
import attemptService from "services/attemptService";

// Images
import writtenExpressionImage from "assets/images/tcf/written-expression-1.svg";
import authService from "services/authService";



// Styles pour le contenu du blog
const blogContentStyles = {
  marginTop: "10px",
  padding: "8px",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  borderRadius: "8px",
  maxHeight: "150px",
  overflow: "hidden",
  "& .ql-editor": {
    padding: "0",
    fontSize: "0.8rem",
    lineHeight: "1.3",
  },
  "& .ql-container": {
    border: "none",
  },
};

function TCFSimulatorWritten() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openRecap, setOpenRecap] = useState(false);
  const [openTaskRecap, setOpenTaskRecap] = useState(false);
  const [openResults, setOpenResults] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [examResults, setExamResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const [openRetakeDialog, setOpenRetakeDialog] = useState(false);
  const [retakeData, setRetakeData] = useState(null);
  const [retakeSubjectId, setRetakeSubjectId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  // Calcul de la pagination
  const totalPages = Math.ceil(subjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubjects = subjects.slice(startIndex, endIndex);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll vers le haut lors du changement de page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRecap = (subject) => {
    setSelectedSubject(subject);
    setOpenRecap(true);
  };

  const handleCloseRecap = () => {
    setOpenRecap(false);
    setSelectedSubject(null);
  };

  const handleOpenTaskRecap = (subject) => {
    setSelectedSubject(subject);
    setOpenTaskRecap(true);
  };

  const handleCloseTaskRecap = () => {
    setOpenTaskRecap(false);
    setSelectedSubject(null);
  };

  const handleOpenResults = async (subject) => {
    setSelectedSubject(subject);
    setLoadingResults(true);
    setOpenResults(true);
    
    try {
      // Récupérer les examens de l'utilisateur pour ce sujet
      const userExams = await authService.getUserExams();
      const subjectExams = userExams.filter(exam => exam.id_subject === subject.id);
      
      // Récupérer les réponses de l'utilisateur depuis le backend
      let userResponses = {};
      if (subjectExams.length > 0) {
        // Reconstituer les réponses utilisateur depuis les examens du backend
        subjectExams.forEach(exam => {
          if (exam.reponse_utilisateur) {
            try {
              const examResponses = JSON.parse(exam.reponse_utilisateur);
              // Fusionner les réponses par tâche
              Object.keys(examResponses).forEach(taskKey => {
                if (!userResponses[taskKey]) {
                  userResponses[taskKey] = examResponses[taskKey];
                }
              });
            } catch (error) {
              console.error('Erreur lors du parsing des réponses utilisateur:', error);
            }
          }
        });
      }
      console.log('Réponses utilisateur récupérées depuis le backend:', userResponses);
      
      if (subjectExams.length > 0) {
        // Grouper les examens par sujet et tâche pour reconstituer les résultats complets
        const examsByTask = {};
        subjectExams.forEach(exam => {
          const taskId = exam.id_task || exam.task?.id || 1;
          if (!examsByTask[taskId] || new Date(exam.date_passage) > new Date(examsByTask[taskId].date_passage)) {
            examsByTask[taskId] = exam;
          }
        });
        
        // Fonction helper pour traiter les points (éviter la redondance)
        const processPoints = (examValues, fieldName) => {
          const allPoints = examValues
            .map(exam => exam[fieldName])
            .filter(point => point && point.trim())
            .flatMap(point => {
              // Diviser par virgule et nettoyer chaque point
              return point.split(',').map(p => p.trim().replace(/^[\s\-\*\•]+|[\s\-\*\•]+$/g, ''));
            })
            .filter(point => point && point.length > 0)
            .map(point => {
              // Normaliser le texte pour une meilleure détection des doublons
              return point.charAt(0).toUpperCase() + point.slice(1).toLowerCase();
            });
          
          // Éliminer les doublons en utilisant un Set avec normalisation
          const uniquePoints = [...new Set(allPoints)];
          
          // Filtrer les points qui sont des sous-chaînes d'autres points
          return uniquePoints.filter((point, index) => {
            return !uniquePoints.some((otherPoint, otherIndex) => {
              return index !== otherIndex && 
                     otherPoint.length > point.length && 
                     otherPoint.toLowerCase().includes(point.toLowerCase());
            });
          });
        };
        
        const examValues = Object.values(examsByTask);
        
        // Reconstituer le format attendu par la modal avec points par tâche
        const taskResults = Object.keys(examsByTask)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(taskId => {
            const exam = examsByTask[taskId];
            return {
              correction: exam.reponse_ia || "Aucune correction disponible",
              pointsForts: exam.points_fort ? 
                exam.points_fort.split(',').map(p => p.trim()).filter(p => p) : 
                ["Aucun point fort détecté"],
              pointsAmeliorer: exam.point_faible ? 
                exam.point_faible.split(',').map(p => p.trim()).filter(p => p) : 
                ["Le texte est incompréhensible et ne répond pas à la consigne"],
              // Ajouter la réponse de l'utilisateur
              userResponse: exam.reponse_utilisateur || "Aucune réponse fournie"
            };
          });
        
        const formattedResults = {
          NoteExam: examValues[0]?.score || "Non éligible (langue non lisible)",
          corrections_taches: taskResults.map(task => task.correction),
          taskResults: taskResults,
          pointsForts: processPoints(examValues, 'points_fort'),
          pointsAmeliorer: processPoints(examValues, 'point_faible'),
          // Ajouter les réponses de l'utilisateur
          user_responses: taskResults.map(task => task.userResponse) 
        };
        
        // Si aucun point fort/faible n'est trouvé, utiliser des valeurs par défaut
        if (formattedResults.pointsForts.length === 0) {
          formattedResults.pointsForts = ["Aucun point fort détecté (pas de contenu lisible)"];
        }
        if (formattedResults.pointsAmeliorer.length === 0) {
          formattedResults.pointsAmeliorer = ["Le texte est incompréhensible et ne répond pas à la consigne"];
        }
        
        setExamResults(formattedResults);
      } else {
        setExamResults(null);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des résultats:', error);
      setExamResults(null);
    } finally {
      setLoadingResults(false);
    }
  };

  const handleCloseResults = () => {
    setOpenResults(false);
    setSelectedSubject(null);
    setExamResults(null);
  };

  const handleStartExam = () => {
    if (selectedSubject) {
      navigate(`/simulateur-tcf-canada/expression-ecrits/${selectedSubject.id}/exam`);
    }
    handleCloseRecap();
  };

  const handleRetakeExam = async (subjectId) => {
    try {
      // Vérifier le nombre de tentatives
      const attemptData = await attemptService.checkAttempts(subjectId);
      
      if (attemptData.can_attempt) {
        // Ouvrir la modal de confirmation
        setRetakeData(attemptData);
        setRetakeSubjectId(subjectId);
        setOpenRetakeDialog(true);
      } else {
        // Ouvrir la modal d'erreur (tentatives épuisées)
        setRetakeData({ ...attemptData, error: 'max_attempts' });
        setRetakeSubjectId(subjectId);
        setOpenRetakeDialog(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des tentatives:', error);
      // Ouvrir la modal d'erreur (erreur technique)
      setRetakeData({ error: 'technical_error' });
      setRetakeSubjectId(subjectId);
      setOpenRetakeDialog(true);
    }
   };

  const handleConfirmRetake = async () => {
    try {
      // Incrémenter le compteur de tentatives
      await attemptService.incrementAttempt(retakeSubjectId);
      
      // Fermer la modal
      setOpenRetakeDialog(false);
      setRetakeData(null);
      setRetakeSubjectId(null);
      
      // Rediriger vers l'examen
      navigate(`/simulateur-tcf-canada/expression-ecrits/${retakeSubjectId}/exam?isRetake=true`);
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des tentatives:', error);
      // Afficher une erreur dans la modal
      setRetakeData({ error: 'technical_error' });
    }
  };

  const handleCloseRetakeDialog = () => {
    setOpenRetakeDialog(false);
    setRetakeData(null);
    setRetakeSubjectId(null);
  };

  // Fonction pour charger les sujets
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les sujets depuis le service TCFAdmin
      const writtenData = await TCFAdminService.getAllSubjects('Écrit');
      const userSubscriptionPlan = await authService.getCurrentUserPlan();
      // Récupérer les examens passés par l'utilisateur
      const userExams = await authService.getUserExams();
      console.log(userSubscriptionPlan);
      console.log('Examens utilisateur:', userExams);
      
      // Créer un Set des IDs de sujets déjà passés par l'utilisateur
      // Utiliser un Set pour éviter les doublons
      const completedSubjectIds = new Set();
      
      // Ajouter chaque ID de sujet au Set
      userExams.forEach(exam => {
        completedSubjectIds.add(exam.id_subject);
      });
      
      console.log('IDs de sujets complétés:', Array.from(completedSubjectIds));
      
      // Transformer les données pour correspondre au format attendu
      const formattedSubjects = writtenData.map(subject => {
        const plan = subject.plans;
        const userPlan = userSubscriptionPlan;
      
        let status = "";
      
        // Vérifier si l'utilisateur a déjà passé cet examen
        if (completedSubjectIds.has(subject.id)) {
          status = "completed";
        } else if (plan === "Pack Écrit Standard") {
          status = ""; // Toujours accessible
        } else if (plan === "Pack Écrit Performance") {
          if (userPlan === "standard") {
            status = "locked";
          } else {
            status = ""; // performance ou pro
          }
        } else if (plan === "Pack Écrit Pro") {
          if (userPlan === "standard" || userPlan === "performance") {
            status = "locked";
          } else {
            status = ""; // seulement si utilisateur est "pro"
          }
        }
      
        return {
          id: subject.id,
          name: "",
          blog: subject.blog || "",
          tasks: subject.tasks || [],
          pack: subject.name + ' : ' + subject.combination,
          bgColor: "#f72585",
          duration: subject.duration || 60,
          status: status
        };
      });
      
      // Define the desired order of plans
      const planOrder = {
        "Pack Écrit Standard": 1,
        "Pack Écrit Performance": 2,
        "Pack Écrit Pro": 3,
      };

      // Sort the subjects based on the defined order
      formattedSubjects.sort((a, b) => {
        const orderA = planOrder[a.pack] || 99; // Default to a high number if plan is not in the map
        const orderB = planOrder[b.pack] || 99;
        return orderA - orderB;
      });

      setSubjects(formattedSubjects);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des sujets:", error);
      // En cas d'erreur, utiliser les données statiques comme fallback
      setSubjects([]);
      setError("Impossible de charger les sujets. Veuillez réessayer plus tard.");
      setLoading(false);
    }
  };

  // Effect pour charger les sujets au montage et lors des rafraîchissements
  useEffect(() => {
    fetchSubjects();
  }, [refreshTrigger]);

  // Effect pour détecter quand l'utilisateur revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // L'utilisateur revient sur la page, rafraîchir les données
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const handleFocus = () => {
      // L'utilisateur revient sur la fenêtre, rafraîchir les données
      setRefreshTrigger(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox 
        pt={3} 
        pb={3} 
        sx={{
          background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.8) 0%, rgba(240, 248, 255, 0.9) 30%, rgba(219, 234, 254, 0.85) 70%, rgba(191, 219, 254, 0.8) 100%)',
          minHeight: '100vh',
          padding: { xs: 2, md: 4 },
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <MDBox 
          mx="auto" 
          p={2} 
          maxWidth="1400px"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            p: { xs: 3, md: 5 },
          }}
        >
          <MDBox 
            mb={4} 
            textAlign="center"
            sx={{
              maxWidth: '800px',
              margin: '0 auto',
              padding: { xs: 2, md: 3 }
            }}
          >
            <MDTypography 
              variant="h3" 
              fontWeight="bold" 
              mb={1}
              sx={{
                background: 'linear-gradient(90deg, #0077b6 0%, #023e8a 100%)', // Updated gradient for title
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0px 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              Coach d'Expression Écrite
            </MDTypography>
            <MDTypography 
              variant="body1" 
              color="text" 
              opacity={0.8}
              mb={3}
            >
              Entraînez-vous comme dans les conditions réelles du TCF canada.
              Choisissez un sujet, rédigez vos réponses et recevez une évaluation détaillée.
            </MDTypography>
          </MDBox>
          
          {/* Afficher l'erreur si elle existe */}
          {error && (
            <MDBox mb={3} maxWidth="800px" mx="auto">
              <MDAlert color="error" dismissible>
                {error}
              </MDAlert>
            </MDBox>
          )}
          
          {/* Afficher l'indicateur de chargement ou les sujets */}
          {loading ? (
            <MDBox display="flex" justifyContent="center" p={3}>
              <CircularProgress color="info" />
            </MDBox>
          ) : subjects.length === 0 ? (
            <MDBox mb={3} maxWidth="800px" mx="auto">
              <MDAlert color="warning">
                Aucun sujet d'expression écrite n'est disponible pour le moment. Veuillez revenir plus tard.
              </MDAlert>
            </MDBox>
          ) : (
            <>
            <Grid container spacing={4}>
              {currentSubjects.map((subject) => (
                <Grid item xs={12} md={6} lg={4} key={subject.id}>
                  {subject.status === "completed" ? (
                    <CompletedExpressionCard
                      title={subject.name}
                      onTaskClick={() => handleOpenTaskRecap(subject)}
                      onResultClick={() => handleOpenResults(subject)}
                      onRetakeClick={() => handleRetakeExam(subject.id)}
                      description={
                        <ReactQuill
                          value={subject.blog || "Sujet d'expression écrite"}
                          readOnly={true}
                          theme="bubble"
                          modules={{ toolbar: false }}
                          sx={blogContentStyles}
                        />
                      }
                      pack={subject.pack}
                      bgColor={subject.bgColor}
                      duration={subject.duration || 60}
                      sx={{
                        borderRadius: '12px', // Rounded corners for cards
                        overflow: 'hidden', // Hide overflow for the top bar
                        position: 'relative', // Needed for absolute positioning of top bar
                        '&::before': { // Add a colored bar at the top
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '6px', // Height of the color bar
                          backgroundColor: subject.bgColor, // Use subject's color
                        },
                        pt: 2, // Add padding at the top to account for the bar
                      }}
                    />
                  ) : subject.status === "locked" ? (
                    <LockedExpressionCard
                      title={subject.name}
                      description={
                        <ReactQuill
                          value={subject.blog || "Sujet d'expression écrite"}
                          readOnly={true}
                          theme="bubble"
                          modules={{ toolbar: false }}
                          sx={blogContentStyles}
                        />
                      }
                      pack={subject.pack}
                      bgColor={subject.bgColor}
                      duration={subject.duration || 60}
                      sx={{
                        borderRadius: '12px', // Rounded corners for cards
                        overflow: 'hidden', // Hide overflow for the top bar
                        position: 'relative', // Needed for absolute positioning of top bar
                        '&::before': { // Add a colored bar at the top
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '6px', // Height of the color bar
                          backgroundColor: subject.bgColor, // Use subject's color
                        },
                        pt: 2, // Add padding at the top to account for the bar
                      }}
                    />
                  ) : (
                    <WrittenExpressionCard
                      title={subject.name}
                      description={
                        <ReactQuill
                          value={subject.blog || "Sujet d'expression écrite"}
                          readOnly={true}
                          theme="bubble"
                          modules={{ toolbar: false }}
                          sx={blogContentStyles}
                        />
                      }
                      pack={subject.pack}
                      bgColor={subject.bgColor}
                      duration={subject.duration || 60}
                      action={{
                        type: "function",
                        onClick: () => handleOpenRecap(subject),
                        label: "Démarrer le coaching",
                        color: "primary",
                      }}
                      sx={{
                        borderRadius: '12px', // Rounded corners for cards
                        overflow: 'hidden', // Hide overflow for the top bar
                        position: 'relative', // Needed for absolute positioning of top bar
                        '&::before': { // Add a colored bar at the top
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '6px', // Height of the color bar
                          backgroundColor: subject.bgColor, // Use subject's color
                        },
                        pt: 2, // Add padding at the top to account for the bar
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            
            {/* Pagination moderne */}
            {totalPages > 1 && (
              <MDBox 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
                mt={6}
                mb={2}
              >
                <Stack spacing={2}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        fontSize: '1rem',
                        fontWeight: 500,
                        minWidth: '44px',
                        height: '44px',
                        margin: '0 4px',
                        borderRadius: '12px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                        },
                        '&.Mui-selected': {
                          background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                          color: 'white',
                          fontWeight: 600,
                          boxShadow: '0 4px 16px rgba(33, 150, 243, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            transform: 'translateY(-2px)',
                          },
                        },
                        '&.MuiPaginationItem-firstLast, &.MuiPaginationItem-previousNext': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            transform: 'translateY(-2px)',
                          },
                        },
                      },
                    }}
                  />
                  <MDBox textAlign="center" mt={2}>
                    <MDTypography variant="body2" color="text" opacity={0.7}>
                      Page {currentPage} sur {totalPages} • {subjects.length} sujets au total
                    </MDTypography>
                  </MDBox>
                </Stack>
              </MDBox>
            )}
            </>
          )}
        </MDBox>
      </MDBox>
      
      {/* Dialog de récapitulatif moderne */}
      <Dialog
        open={openRecap}
        onClose={handleCloseRecap}
        maxWidth="1350px"
        fullWidth
        PaperProps={{
          sx: {
            left: 12,
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
            py: 3,
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
          <MDBox display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Icon sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.9 }}>assignment</Icon>
            <MDTypography variant="h4" fontWeight="bold" color="white">
              {selectedSubject?.name || "Mai 2025 : Combinaison N1"}
            </MDTypography>
            <Chip
              label={selectedSubject?.pack || "Pack Écrit Standard"}
              sx={{
                mt: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
              }}
            />
          </MDBox>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <MDBox p={4}>
            {/* Informations générales */}
            <MDBox mb={4}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon sx={{ color: '#667eea', mr: 1 }}>schedule</Icon>
                <MDTypography variant="h6" fontWeight="bold" color="text">
                  Durée de l'examen
                </MDTypography>
              </MDBox>
              <MDBox
                sx={{
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  borderRadius: '12px',
                  p: 2,
                  border: '1px solid #e2e8f0',
                }}
              >
                <MDTypography variant="body1" color="text" fontWeight="medium">
                  {selectedSubject?.duration || 60} minutes
                </MDTypography>
              </MDBox>
            </MDBox>
            
            <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />
            
            {/* Liste des tâches */}
            <MDBox>
              <MDBox display="flex" alignItems="center" mb={3}>
                <Icon sx={{ color: '#667eea', mr: 1 }}>list_alt</Icon>
                <MDTypography variant="h6" fontWeight="bold" color="text">
                  Tâches à réaliser ({selectedSubject?.tasks?.length || 0})
                </MDTypography>
              </MDBox>
              
              <MDBox sx={{ maxHeight: '300px', overflowY: 'auto', pr: 1 }}>
                {selectedSubject?.tasks?.map((task, index) => (
                  <MDBox
                    key={task.id || index}
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      borderRadius: '16px',
                      p: 3,
                      mb: 2,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <MDBox display="flex" alignItems="center" mb={2}>
                      <Chip
                        label={`Tâche ${index + 1}`}
                        size="small"
                        sx={{
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontWeight: 'bold',
                          mr: 2,
                        }}
                      />
                      {task.wordCount && (
                        <Chip
                          label={`${task.wordCount} mots`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontWeight: 'medium',
                          }}
                        />
                      )}
                      {task.duration && (
                        <Chip
                          label={`${task.duration} min`}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#667eea',
                            color: '#667eea',
                            fontWeight: 'medium',
                            ml: 1,
                          }}
                        />
                      )}
                    </MDBox>
                    
                    {task.title && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: task.title }}
                        style={{
                          fontSize: '1.25rem', // Equivalent to subtitle1
                          fontWeight: 'bold',
                          color: 'text.primary', // Assuming text color
                          marginBottom: '8px', // Equivalent to mb={1}
                        }}
                      />
                    )}
                    
                    {task.structure && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: task.structure }}
                        style={{
                          fontSize: '1rem', // Equivalent to body2
                          color: 'text.secondary', // Assuming text color with opacity
                          opacity: 0.8,
                        }}
                      />
                    )}
                    
                    {task.instructions && (
                      <MDBox mt={2}>
                        <div 
                          dangerouslySetInnerHTML={{ __html: task.instructions }}
                          style={{
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '1rem',
                            lineHeight: '1.5',
                          }}
                        />
                      </MDBox>
                    )}
                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          </MDBox>
        </DialogContent>
        
        <DialogActions
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            p: 3,
            gap: 2,
          }}
        >
          <MDButton
            onClick={handleCloseRecap}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              borderWidth: '2px',
              '&:hover': {
                borderWidth: '2px',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <Icon  sx={{ mr: 1 }}>arrow_back</Icon>
            Retour
          </MDButton>
          
          <MDButton
            onClick={handleStartExam}
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
            Démarrer le coaching
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog for Task Recap */}
      <Dialog open={openTaskRecap} onClose={handleCloseTaskRecap} maxWidth="md" fullWidth>
        <DialogTitle>
          <MDTypography variant="h5" fontWeight="bold">
            Consultation de la Tâche
          </MDTypography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSubject && (
            <MDBox>
              <MDTypography variant="h6" mb={1}>
                Tâches:
              </MDTypography>
              {selectedSubject.tasks && selectedSubject.tasks.length > 0 ? (
                selectedSubject.tasks.map((task, index) => (
                  <MDBox key={index} mb={2} p={2} sx={{ border: "1px solid #eee", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
                    <MDTypography variant="body2" fontWeight="medium">
                      Tâche {index + 1}:<span  dangerouslySetInnerHTML={{ __html:  task.title}} />
                    </MDTypography>
                    <MDTypography variant="body2" color="text" mt={1} dangerouslySetInnerHTML={{ __html: task.description }} />
                  </MDBox>
                ))
              ) : (
                <MDTypography variant="body2" color="text">
                  Aucune tâche disponible pour ce sujet.
                </MDTypography>
              )}
            </MDBox>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton
            onClick={handleCloseTaskRecap}
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

      {/* Dialog for Exam Results */}
      <Dialog
        open={openResults}
        onClose={handleCloseResults}
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
            py: 3,
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
          <MDBox display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Icon sx={{ fontSize: '2.5rem', mb: 1, opacity: 0.9 }}>check_circle</Icon>
            <MDTypography variant="h4" fontWeight="bold" color="white">
              Résultats de votre évaluation
            </MDTypography>
            <MDTypography variant="body1" color="white" opacity={0.9} mt={1}>
              Mai 2026
            </MDTypography>
            <Chip
              label={examResults?.NoteExam || "Non éligible (langue non lisible)"}
              sx={{
                mt: 2,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '20px',
                fontSize: '0.9rem',
                px: 2,
                py: 1
              }}
            />
          </MDBox>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {loadingResults ? (
            <MDBox display="flex" justifyContent="center" p={4}>
              <CircularProgress color="info" />
            </MDBox>
          ) : examResults ? (
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
                    
                    {examResults.taskResults?.map((taskResult, index) => (
                      <MDBox
                        key={index}
                        sx={{
                          background: 'white',
                          borderRadius: '12px',
                          p: 3,
                          border: '1px solid #e2e8f0',
                          mb: 3
                        }}
                      >
                        <MDBox display="flex" alignItems="center" mb={2}>
                          <Chip
                            label={`Tâche ${index + 1}`}
                            size="small"
                            sx={{
                              backgroundColor: '#667eea',
                              color: 'white',
                              fontWeight: 'bold',
                              mr: 2,
                            }}
                          />
                        </MDBox>
                        
                        {/* Section avec deux colonnes: Votre réponse et Correction proposée */}
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
                              <MDTypography variant="body2" color="text" lineHeight={1.8}>
                                {examResults.user_responses[index] || 'Aucune réponse fournie'}
                              </MDTypography>
                              <MDBox mt={2} display="flex" justifyContent="flex-end">
                                <MDTypography variant="caption" color="text">
                                  {examResults.user_responses[index] ? examResults.user_responses[index].split(/\s+/).filter(word => word.length > 0).length : 0} mots
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
                                <ReactMarkdown>{taskResult.correction}</ReactMarkdown>
                              </MDBox>
                              <MDBox mt={2} display="flex" justifyContent="flex-end">
                                <MDTypography variant="caption" color="text">
                                  {taskResult.correction ? taskResult.correction.split(/\s+/).filter(word => word.length > 0).length : 0} mots
                                </MDTypography>
                              </MDBox>
                            </MDBox>
                          </Grid>
                        </Grid>
                        
                        {/* Points forts et points à améliorer pour cette tâche */}
                        <Grid container spacing={3} mt={2}>
                          {/* Points forts */}
                          <Grid item xs={12} md={6}>
                            <MDBox
                              sx={{
                                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                                borderRadius: '12px',
                                p: 2,
                                border: '1px solid #a7f3d0',
                              }}
                            >
                              <MDBox display="flex" alignItems="center" mb={2}>
                                <Icon sx={{ color: '#059669', mr: 1, fontSize: '1.2rem' }}>recommend</Icon>
                                <MDTypography variant="subtitle1" fontWeight="bold" color="#059669">
                                  Points forts
                                </MDTypography>
                              </MDBox>
                              
                              <MDBox
                                sx={{
                                  background: 'rgba(255,255,255,0.7)',
                                  borderRadius: '8px',
                                  p: 2,
                                }}
                              >
                                {taskResult.pointsForts?.map((point, pointIndex) => (
                                  <MDBox key={pointIndex} display="flex" alignItems="flex-start" mb={1}>
                                    <Icon sx={{ color: '#059669', mr: 1, fontSize: '0.9rem', mt: 0.2 }}>check_circle</Icon>
                                    <MDTypography variant="body2" color="#059669" fontWeight="medium" sx={{ flex: 1 }}>
                                      {point}
                                    </MDTypography>
                                  </MDBox>
                                ))}
                              </MDBox>
                            </MDBox>
                          </Grid>
                          
                          {/* Points à améliorer */}
                          <Grid item xs={12} md={6}>
                            <MDBox
                              sx={{
                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                borderRadius: '12px',
                                p: 2,
                                border: '1px solid #fde68a',
                              }}
                            >
                              <MDBox display="flex" alignItems="center" mb={2}>
                                <Icon sx={{ color: '#d97706', mr: 1, fontSize: '1.2rem' }}>insights</Icon>
                                <MDTypography variant="subtitle1" fontWeight="bold" color="#d97706">
                                  Points à améliorer
                                </MDTypography>
                              </MDBox>
                              
                              <MDBox sx={{ space: 1 }}>
                                {taskResult.pointsAmeliorer?.map((point, pointIndex) => (
                                  <MDBox
                                    key={pointIndex}
                                    sx={{
                                      background: 'rgba(255,255,255,0.7)',
                                      borderRadius: '8px',
                                      p: 2,
                                      mb: 1,
                                      display: 'flex',
                                      alignItems: 'flex-start'
                                    }}
                                  >
                                    <Icon sx={{ color: '#d97706', mr: 1, fontSize: '0.9rem', mt: 0.2 }}>circle</Icon>
                                    <MDTypography variant="body2" color="#d97706" sx={{ flex: 1 }}>
                                      {point}
                                    </MDTypography>
                                  </MDBox>
                                ))}
                              </MDBox>
                            </MDBox>
                          </Grid>
                        </Grid>
                      </MDBox>
                    )) || (
                      <MDBox
                        sx={{
                          background: 'white',
                          borderRadius: '12px',
                          p: 3,
                          border: '1px solid #e2e8f0',
                          mb: 2
                        }}
                      >
                        <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.6 }}>
                          Aucune correction disponible pour le moment.
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          ) : (
            <MDBox p={4} textAlign="center">
              <MDTypography variant="body1" color="text">
                Aucun résultat trouvé pour ce sujet.
              </MDTypography>
            </MDBox>
          )}
        </DialogContent>
        
        <DialogActions
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            p: 3,
            justifyContent: 'center'
          }}
        >
          <MDButton
            onClick={handleCloseResults}
            variant="gradient"
            color="info"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              minWidth: '200px'
            }}
          >
            <Icon sx={{ mr: 1 }}>arrow_back</Icon>
            RETOUR AUX EXAMS
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation pour repasser l'examen */}
      <Dialog
        open={openRetakeDialog}
        onClose={handleCloseRetakeDialog}
        maxWidth="sm"
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
            background: retakeData?.error ? 
              'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
              'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            textAlign: 'center',
            py: 3,
            position: 'relative',
          }}
        >
          <Icon sx={{ fontSize: '2.5rem', mb: 1 }}>
            {retakeData?.error ? 'error' : 'refresh'}
          </Icon>
          <MDTypography variant="h5" fontWeight="bold" color="white">
            {retakeData?.error === 'max_attempts' ? 'Tentatives épuisées' :
             retakeData?.error === 'technical_error' ? 'Erreur technique' :
             'Confirmer la tentative'}
          </MDTypography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          {retakeData?.error === 'max_attempts' ? (
            <MDBox textAlign="center">
              <MDTypography variant="body1" color="text" mb={2}>
                Vous avez déjà utilisé votre tentative pour cet examen.
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Vous ne pouvez plus repasser cet examen.
              </MDTypography>
            </MDBox>
          ) : retakeData?.error === 'technical_error' ? (
            <MDBox textAlign="center">
              <MDTypography variant="body1" color="text" mb={2}>
                Une erreur technique s'est produite.
              </MDTypography>
              <MDTypography variant="body2" color="text" opacity={0.7}>
                Veuillez réessayer plus tard.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox>
              <MDBox
                sx={{
                  background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                  borderRadius: '12px',
                  p: 3,
                  mb: 3,
                  border: '1px solid #81d4fa'
                }}
              >
                <MDTypography variant="h6" fontWeight="bold" color="#0277bd" mb={2}>
                  Informations sur les tentatives
                </MDTypography>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <Icon sx={{ color: '#0277bd', mr: 1 }}>info</Icon>
                  <MDTypography variant="body2" color="#0277bd">
                    Vous avez droit à 1 tentative pour cet examen
                  </MDTypography>
                </MDBox>
                <MDBox display="flex" alignItems="center" mb={1}>
                  <Icon sx={{ color: '#0277bd', mr: 1 }}>play_circle</Icon>
                  <MDTypography variant="body2" color="#0277bd">
                    Tentative actuelle: {(retakeData?.attempt_count || 0) + 1} / 1
                  </MDTypography>
                </MDBox>
              </MDBox>
              
              <MDBox
                sx={{
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: '12px',
                  p: 3,
                  border: '1px solid #ce93d8'
                }}
              >
                <MDBox display="flex" alignItems="center" mb={1}>
                  <Icon sx={{ color: '#7b1fa2', mr: 1 }}>monetization_off</Icon>
                  <MDTypography variant="body2" color="#7b1fa2" fontWeight="bold">
                    Cette tentative ne déduira pas de crédit de votre solde
                  </MDTypography>
                </MDBox>
              </MDBox>
              
              <MDBox mt={3} textAlign="center">
                <MDTypography variant="body1" color="text">
                  Voulez-vous commencer la tentative?
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </DialogContent>
        
        <DialogActions
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            p: 3,
            justifyContent: 'center',
            gap: 2
          }}
        >
          <MDButton
            onClick={handleCloseRetakeDialog}
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              minWidth: '120px'
            }}
          >
            {retakeData?.error ? 'Fermer' : 'Annuler'}
          </MDButton>
          
          {!retakeData?.error && (
            <MDButton
              onClick={handleConfirmRetake}
              variant="gradient"
              color="info"
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                minWidth: '180px'
              }}
            >
              <Icon sx={{ mr: 1 }}>play_arrow</Icon>
              Commencer la tentative
            </MDButton>
          )}
        </DialogActions>
      </Dialog>
      
      <Footer />
    </DashboardLayout>
  );
}

export default TCFSimulatorWritten;