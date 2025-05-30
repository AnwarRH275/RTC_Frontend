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
import { useNavigate } from "react-router-dom";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import WrittenExpressionCard from "examples/Cards/TCFCards/WrittenExpressionCard";
import CompletedExpressionCard from "examples/Cards/TCFCards/CompletedExpressionCard";
import LockedExpressionCard from "examples/Cards/TCFCards/LockedExpressionCard";

// Services
import TCFAdminService from "services/tcfAdminService";

// Images
import writtenExpressionImage from "assets/images/tcf/written-expression-1.svg";
import authService from "services/authService";

// Fonction pour obtenir la couleur en fonction du plan d'abonnement
const getColorByPlan = (plan) => {
  if (!plan) return "#3a86ff"; // Couleur par défaut
  
  const planLower = plan.toLowerCase();
  
  if (planLower.includes("standard")) {
    return "#3a86ff"; // Bleu pour Pack Écrit Standard
  } else if (planLower.includes("performance") || planLower.includes("performence")) {
    return "#f72585"; // Rose pour Pack Écrit Performance
  } else if (planLower.includes("pro")) {
    return "#38b000"; // Vert pour Pack Écrit Pro
  }
  
  return "#3a86ff"; // Couleur par défaut si aucune correspondance
};

// Fonction pour attribuer un statut aléatoire
const getRandomStatus = () => {
  const statuses = ["", "completed", "locked"];
  const randomIndex = Math.floor(Math.random() * statuses.length);
  return statuses[randomIndex];
};

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
  const [selectedSubject, setSelectedSubject] = useState(null);
  const navigate = useNavigate();

  const handleOpenRecap = (subject) => {
    setSelectedSubject(subject);
    setOpenRecap(true);
  };

  const handleCloseRecap = () => {
    setOpenRecap(false);
    setSelectedSubject(null);
  };

  const handleStartExam = () => {
    if (selectedSubject) {
      navigate(`/tcf-simulator/written/${selectedSubject.id}/exam`);
    }
    handleCloseRecap();
  };

  useEffect(() => {
    const fetchSubjects = async () => {
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
    
    fetchSubjects();
  }, []);


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox 
        pt={3} 
        pb={3} 
        sx={{
          background: 'linear-gradient(135deg, #e0f2f7 0%, #b2ebf2 100%)', // Lighter, more inviting gradient
          minHeight: '100vh',
          padding: { xs: 2, md: 4 }, // Add padding to the main container
        }}
      >
        <MDBox 
          mx="auto" 
          p={2} 
          maxWidth="1400px"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background for content area
            borderRadius: '16px', // Rounded corners for the content area
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)', // Subtle shadow
            backdropFilter: 'blur(5px)', // Optional: add a blur effect
            p: { xs: 3, md: 5 }, // Adjust padding inside the content area
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
              Simulateur d'Expression Écrite
            </MDTypography>
            <MDTypography 
              variant="body1" 
              color="text" 
              opacity={0.8}
              mb={3}
            >
              Choisissez un sujet d'expression écrite pour commencer votre simulation. Vous pourrez
              rédiger votre texte et recevoir une évaluation détaillée basée sur les critères officiels du TCF.
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
            <Grid container spacing={4}>
              {subjects.map((subject) => (
                <Grid item xs={12} md={6} lg={4} key={subject.id}>
                  {subject.status === "completed" ? (
                    <CompletedExpressionCard
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
                        label: "Commencer le test",
                        color: "info",
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
          )}
        </MDBox>
      </MDBox>
      
      {/* Dialog de récapitulatif moderne */}
      <Dialog
        open={openRecap}
        onClose={handleCloseRecap}
        maxWidth="lg"
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            variant="gradient"
            color="info"
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 15px -3px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 20px -3px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            <Icon sx={{ mr: 1 }}>play_arrow</Icon>
            Commencer l'examen
          </MDButton>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </DashboardLayout>
  );
}

export default TCFSimulatorWritten;