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
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
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
import OralExpressionCard from "examples/Cards/TCFCards/OralExpressionCard";
import CompletedExpressionCard from "examples/Cards/TCFCards/CompletedExpressionCard";
import LockedExpressionCard from "examples/Cards/TCFCards/LockedExpressionCard";
// Services
import TCFOralService from "services/tcfOralService";
import attemptService from "services/attemptService";

// Images<<
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

function TCFSimulatorOral() {
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
  const [openMobileWarning, setOpenMobileWarning] = useState(false);
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

      // Récupérer les réponses de l'utilisateur depuis le localStorage
      const storedResponses = localStorage.getItem(`tcf-oral-responses-${subject.id}`);
      const userResponses = storedResponses ? JSON.parse(storedResponses) : {};

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
                ["L'expression orale est incompréhensible et ne répond pas à la consigne"],
              reponse: exam.reponse_utilisateur || ""
            };
          });

        const formattedResults = {
          NoteExam: examValues[0]?.score || "Non éligible (expression non compréhensible)",
          corrections_taches: taskResults.map(task => task.correction),
          taskResults: taskResults,
          pointsForts: processPoints(examValues, 'points_fort'),
          pointsAmeliorer: processPoints(examValues, 'point_faible'),
          // Ajouter les réponses de l'utilisateur (depuis la base de données)
          user_responses: taskResults.map(t => t.reponse)
        };

        // Si aucun point fort/faible n'est trouvé, utiliser des valeurs par défaut
        if (formattedResults.pointsForts.length === 0) {
          formattedResults.pointsForts = ["Aucun point fort détecté (expression non compréhensible)"];
        }
        if (formattedResults.pointsAmeliorer.length === 0) {
          formattedResults.pointsAmeliorer = ["L'expression orale est incompréhensible et ne répond pas à la consigne"];
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

  const handleStartExam = async () => {
    // Vérification si l'utilisateur est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

    if (isMobile) {
      setOpenMobileWarning(true);
      return;
    }

    try {
      // Utiliser les informations utilisateur du contexte
      const userInfo = await authService.getCurrentUser();

      if (userInfo) {
        const currentSold = userInfo.sold;

        // Vérifier si l'utilisateur a suffisamment de crédits
        if (currentSold > 0) {

          // Décrémenter le solde de 1
          const newSold = currentSold - 1;
          console.log(newSold)
          // Mettre à jour le solde dans le backend via API
          await authService.updateSold(userInfo.username, newSold);

          // Naviguer vers l'examen
          if (selectedSubject) {
            navigate(`/simulateur-tcf-expression-orale/${selectedSubject.id}/exam`);
          }
          handleCloseRecap();
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
      navigate(`/simulateur-tcf-expression-orale/${retakeSubjectId}/exam?isRetake=true`);
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
      // Récupérer les sujets depuis le service TCFOral
      const oralDataResponse = await TCFOralService.getAllSubjects();
      const oralData = oralDataResponse.subjects || oralDataResponse;
      const userSubscriptionPlan = await authService.getCurrentUserPlan();
      // Récupérer les examens passés par l'utilisateur
      const userExams = await authService.getUserExams();
      console.log(userSubscriptionPlan);
      console.log('Examens utilisateur:', userExams);

      // Créer un Set des IDs de sujets déjà passés par l'utilisateur pour les examens oraux
      // Utiliser un Set pour éviter les doublons
      const completedSubjectIds = new Set();

      // Ajouter chaque ID de sujet au Set seulement pour les examens de type 'oral'
      userExams.forEach(exam => {
        if (exam.type_exam === 'oral') {
          completedSubjectIds.add(exam.id_subject);
        }
      });

      console.log('IDs de sujets complétés:', Array.from(completedSubjectIds));

      // Transformer les données pour correspondre au format attendu
      const formattedSubjects = oralData.map(subject => {
        const plan = subject.plans;
        const userPlan = userSubscriptionPlan;

        let status = "";

        // Vérifier si l'utilisateur a déjà passé cet examen
        if (completedSubjectIds.has(subject.id)) {
          status = "completed";
        } else if (plan === "Pack Oral Standard") {
          status = ""; // Toujours accessible
        } else if (plan === "Pack Oral Performance") {
          if (userPlan === "standard") {
            status = "locked";
          } else {
            status = ""; // performance ou pro
          }
        } else if (plan === "Pack Oral Pro") {
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
          duration: 12,
          status: status
        };
      });

      // Define the desired order of plans
      const planOrder = {
        "Pack Oral Standard": 1,
        "Pack Oral Performance": 2,
        "Pack Oral Pro": 3,
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
              Coach d'Expression Orale
            </MDTypography>
            <MDTypography
              variant="body1"
              color="text"
              opacity={0.8}
              mb={3}
            >
              Entraînez-vous comme dans les conditions réelles du TCF canada.
              Choisissez un sujet, enregistrez vos réponses et recevez une évaluation détaillée.
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
                Aucun sujet d'expression orale n'est disponible pour le moment. Veuillez revenir plus tard.
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
                            value={subject.blog || "Sujet d'expression orale"}
                            readOnly={true}
                            theme="bubble"
                            modules={{ toolbar: false }}
                            sx={blogContentStyles}
                          />
                        }
                        pack={subject.pack}
                        bgColor={subject.bgColor}
                        duration={12}
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
                            value={subject.blog || "Sujet d'expression orale"}
                            readOnly={true}
                            theme="bubble"
                            modules={{ toolbar: false }}
                            sx={blogContentStyles}
                          />
                        }
                        pack={subject.pack}
                        bgColor={subject.bgColor}
                        duration={12}
                        sx={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            backgroundColor: subject.bgColor,
                          },
                          pt: 2,
                        }}
                      />
                    ) : (
                      <OralExpressionCard
                        title={subject.name}
                        description={
                          <ReactQuill
                            value={subject.blog || "Sujet d'expression orale"}
                            readOnly={true}
                            theme="bubble"
                            modules={{ toolbar: false }}
                            sx={blogContentStyles}
                          />
                        }
                        pack={subject.pack}
                        bgColor={subject.bgColor}
                        duration={12}
                        action={{
                          type: "function",
                          onClick: () => handleOpenRecap(subject),
                          label: selectedSubject?.id === subject.id
                            ? (
                              <MDBox display="flex" alignItems="center" gap={1}>
                                <CircularProgress size={16} sx={{ color: 'white' }} />
                                "Préparation audio..."
                              </MDBox>
                            )
                            : "Démarrer le coaching",
                          color: "primary",
                          disabled: selectedSubject?.id === subject.id,
                        }}
                        sx={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '6px',
                            backgroundColor: subject.bgColor,
                          },
                          pt: 2,
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
                            fontWeight: 120,
                            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                              transform: 'translateY(-2px)',
                            },
                          },
                        },
                      }}
                    />
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
              label={selectedSubject?.pack || "Pack Oral Standard"}
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
                  {selectedSubject?.duration || 12} minutes
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
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                          color: 'text.primary',
                          marginBottom: '8px',
                        }}
                      />
                    )}


                  </MDBox>
                ))}
              </MDBox>
            </MDBox>
          </MDBox>
        </DialogContent>

        <DialogActions
          sx={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderTop: '1px solid #e2e8f0',
            p: 3,
            justifyContent: 'space-between',
          }}
        >
          <MDButton
            variant="outlined"
            color="secondary"
            onClick={handleCloseRecap}
            sx={{
              borderColor: '#94a3b8',
              color: '#64748b',
              '&:hover': {
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.04)',
              }
            }}
          >
            Fermer
          </MDButton>

          <MDButton
            variant="gradient"
            color="info"
            onClick={handleStartExam}
            startIcon={<Icon>mic</Icon>}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 20px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            Démarrer le coaching
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Modal de récapitulatif des tâches */}
      <Dialog
        open={openTaskRecap}
        onClose={handleCloseTaskRecap}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          },
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(90deg, #0077b6 0%, #023e8a 100%)',
          color: 'white',
          borderTopLeftRadius: '15px',
          borderTopRightRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <MDTypography variant="h5" fontWeight="medium" color="white">
            Tâches réalisées
          </MDTypography>
          <MDButton
            variant="text"
            color="white"
            onClick={handleCloseTaskRecap}
            sx={{ minWidth: 'auto', p: 1 }}
          >
            <Icon>close</Icon>
          </MDButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedSubject && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDBox mb={2}>
                  <MDTypography variant="h6" fontWeight="bold" color="primary">
                    {selectedSubject.pack}
                  </MDTypography>
                </MDBox>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <MDBox mb={2}>
                  <MDTypography variant="h6" fontWeight="bold" color="info">
                    Tâches réalisées
                  </MDTypography>
                </MDBox>

                {selectedSubject.tasks && selectedSubject.tasks.map((task, index) => (
                  <MDBox
                    key={task.id}
                    mb={2}
                    p={2}
                    sx={{
                      backgroundColor: 'rgba(67, 97, 238, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(67, 97, 238, 0.2)',
                    }}
                  >
                    <MDBox display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={`Tâche ${index + 1}`}
                        color="success"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <MDTypography variant="subtitle1" fontWeight="medium">
                        {task.taskType === 'entretien' ? 'Entretien' :
                          task.taskType === 'questions' ? 'Jeu de rôle' :
                            task.taskType === 'expression' ? 'Expression d\'un point de vue' :
                              'Tâche orale'}
                      </MDTypography>
                      <Chip
                        label="Complété"
                        color="success"
                        size="small"
                        icon={<Icon>check</Icon>}
                        sx={{ ml: 'auto', backgroundColor: "rgba(79, 204, 231, 1)", color: "white" }}
                      />
                    </MDBox>
                    <MDBox mb={1}>
                      <ReactQuill
                        value={task.title || "Titre de la tâche non disponible"}
                        readOnly={true}
                        theme="bubble"
                        modules={{ toolbar: false }}
                      />
                    </MDBox>
                  </MDBox>
                ))}
              </Grid>

              <Grid item xs={12}>
                <MDBox display="flex" justifyContent="flex-end" mt={2}>
                  <MDButton
                    variant="gradient"
                    color="info"
                    onClick={() => handleOpenResults(selectedSubject)}
                    startIcon={<Icon>assessment</Icon>}
                  >
                    Voir les résultats
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal des résultats */}
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
              {loadingResults ? (
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
                        {examResults?.NoteExam || "B1"}
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
                onClick={handleCloseResults}
              >
                <Icon sx={{ fontSize: '1.2rem', mr: 0.5, color: 'rgba(255,255,255,0.9)' }}>refresh</Icon>
                <MDTypography variant="caption" color="white" fontWeight="medium" sx={{ opacity: 0.9 }}>
                  Passer un autre examen
                </MDTypography>
              </MDBox>
            </MDBox>

            <MDButton
              variant="text"
              color="white"
              onClick={handleCloseResults}
              sx={{ minWidth: 'auto', p: 1 }}
            >
              <Icon>close</Icon>
            </MDButton>
          </MDBox>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <MDBox p={4}>
            <MDTypography variant="body1" color="text" mb={4}>
              Voici les résultats détaillés de votre examen d'expression orale TCF Canada
            </MDTypography>

            {loadingResults ? (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress color="info" />
              </MDBox>
            ) : examResults ? (
              /* Résultats par tâche */
              selectedSubject && selectedSubject.tasks && selectedSubject.tasks.map((task, index) => (
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
                          {examResults.taskResults && examResults.taskResults[index] && (
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
                                    {examResults.taskResults[index].niveau || "B1"}
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
                              minHeight: '250px',
                            }}
                          >
                            <MDTypography variant="h6" fontWeight="bold" color="dark" mb={2}>
                              Votre réponse:
                            </MDTypography>
                            <MDTypography variant="body2" color="text" lineHeight={1.8} component="div">
                              <div>
                                {examResults.taskResults && examResults.taskResults[index] && examResults.taskResults[index].reponse ?
                                  examResults.taskResults[index].reponse
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
                              minHeight: '250px',
                            }}
                          >
                            <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                              Correction proposée :
                            </MDTypography>

                            {examResults.taskResults && examResults.taskResults[index] && examResults.taskResults[index].correction ? (
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
                                <ReactMarkdown>{examResults.taskResults[index].correction}</ReactMarkdown>
                              </MDBox>
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
                                  {examResults.taskResults && examResults.taskResults[index] && examResults.taskResults[index].pointsForts && examResults.taskResults[index].pointsForts.length > 0 ? (
                                    <MDBox component="ul" pl={2} mt={0} sx={{ listStyle: 'none', padding: 0 }}>
                                      {examResults.taskResults[index].pointsForts.map((point, i) => (
                                        <Fade in timeout={800 + (i * 200)} key={`task-${index}-fort-${i}`}>
                                          <MDBox component="li" display="flex" alignItems="flex-start" mb={2}>
                                            <Avatar
                                              sx={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor: '#10b981',
                                                mr: 2,
                                                mt: 0.5
                                              }}
                                            >
                                              <Icon sx={{ fontSize: 20, color: 'white' }}>check</Icon>
                                            </Avatar>
                                            <MDTypography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 500,
                                                color: '#065f46',
                                                flex: 1
                                              }}
                                            >
                                              {point}
                                            </MDTypography>
                                          </MDBox>
                                        </Fade>
                                      ))}
                                    </MDBox>
                                  ) : (
                                    <MDTypography variant="body2" color="text" textAlign="center">
                                      Aucun point fort identifié.
                                    </MDTypography>
                                  )}
                                </Card>
                              </Grid>

                              {/* Points à améliorer */}
                              <Grid item xs={12} md={6}>
                                <MDBox mb={2}>
                                  <MDTypography variant="h6" fontWeight="bold" color="dark">
                                    <Icon sx={{ mr: 1, verticalAlign: 'middle', color: '#f59e0b' }}>trending_up</Icon>
                                    Points à améliorer
                                  </MDTypography>
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
                                  {examResults.taskResults && examResults.taskResults[index] && examResults.taskResults[index].pointsAmeliorer && examResults.taskResults[index].pointsAmeliorer.length > 0 ? (
                                    <MDBox component="ul" pl={2} mt={0} sx={{ listStyle: 'none', padding: 0 }}>
                                      {examResults.taskResults[index].pointsAmeliorer.map((point, i) => (
                                        <Fade in timeout={1000 + (i * 200)} key={`task-${index}-ameliorer-${i}`}>
                                          <MDBox component="li" display="flex" alignItems="flex-start" mb={2}>
                                            <Avatar
                                              sx={{
                                                width: 36,
                                                height: 36,
                                                backgroundColor: '#f59e0b',
                                                mr: 2,
                                                mt: 0.5
                                              }}
                                            >
                                              <Icon sx={{ fontSize: 20, color: 'white' }}>trending_up</Icon>
                                            </Avatar>
                                            <MDTypography
                                              variant="body2"
                                              sx={{
                                                fontWeight: 500,
                                                color: '#92400e',
                                                flex: 1
                                              }}
                                            >
                                              {point}
                                            </MDTypography>
                                          </MDBox>
                                        </Fade>
                                      ))}
                                    </MDBox>
                                  ) : (
                                    <MDTypography variant="body2" color="text" textAlign="center">
                                      Aucun point à améliorer identifié.
                                    </MDTypography>
                                  )}
                                </Card>
                              </Grid>
                            </Grid>
                          </MDBox>
                        </Grid>
                      </Grid>
                    </MDBox>
                  </Card>
                </Fade>
              ))
            ) : (
              <MDBox mb={3} maxWidth="800px" mx="auto">
                <MDAlert color="warning">
                  Aucun résultat disponible pour cet examen. Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.
                </MDAlert>
              </MDBox>
            )}
          </MDBox>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation pour refaire l'examen */}
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

      {/* Dialog Avertissement Mobile */}
      <Dialog
        open={openMobileWarning}
        onClose={() => setOpenMobileWarning(false)}
        aria-labelledby="mobile-warning-title"
      >
        <DialogTitle id="mobile-warning-title" sx={{ textAlign: 'center' }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Icon fontSize="large" color="warning">phonelink_off</Icon>
            Appareil non compatible
          </Box>
        </DialogTitle>
        <DialogContent>
          <MDBox display="flex" flexDirection="column" alignItems="center" py={1}>
            <MDTypography variant="body2" align="center" mb={2}>
              Pour garantir le bon fonctionnement de l'enregistrement vocal et de l'interaction avec l'examinateur IA, <strong>l'examen oral ne peut pas être passé sur un téléphone mobile.</strong>
            </MDTypography>

            <MDAlert color="info" sx={{ width: '100%', mb: 2 }}>
              <MDTypography variant="caption" color="white" display="flex" alignItems="center" gap={1}>
                <Icon fontSize="small">computer</Icon>
                Veuillez vous connecter sur un ordinateur (PC ou Mac) pour passer cet examen.
              </MDTypography>
            </MDAlert>
          </MDBox>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <MDButton
            variant="gradient"
            color="info"
            onClick={() => setOpenMobileWarning(false)}
            sx={{ minWidth: '120px' }}
          >
            J'ai compris
          </MDButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default TCFSimulatorOral;