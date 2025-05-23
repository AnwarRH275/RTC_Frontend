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

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAlert from "components/MDAlert";

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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Récupérer les sujets depuis le service TCFAdmin
        const writtenData = await TCFAdminService.getAllSubjects('Écrit');
        const userSubscriptionPlan = await authService.getCurrentUserPlan();
        //const userSubscriptionPlan = userData?.subscription_plan || "Pack Écrit Standard";
        console.log(userSubscriptionPlan);
        
        // Transformer les données pour correspondre au format attendu
        const formattedSubjects = writtenData.map(subject => {
          const plan = subject.plans;
          const userPlan = userSubscriptionPlan;
        
          let status = "";
        
          if (plan === "Pack Écrit Standard") {
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
            name: subject.name + ' : ' + subject.combination,
            blog: subject.blog || "",
            tasks: subject.tasks || [],
            pack: plan || "Pack Écrit Standard",
            bgColor: getColorByPlan(plan),
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
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
          minHeight: '100vh'
        }}
      >
        <MDBox 
          mx="auto" 
          p={2} 
          maxWidth="1400px"
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
                background: 'linear-gradient(90deg, #2c3e50 0%, #4b6cb7 100%)',
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
                        type: "internal",
                        route: `/tcf-simulator/written/${subject.id}`,
                        color: "info",
                        label: "Commencer le test",
                        icon: "edit",
                      }}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
          )}
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TCFSimulatorWritten;