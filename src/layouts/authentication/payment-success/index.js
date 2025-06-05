/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useInfoUser } from "context/InfoUserContext";
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { Box, CircularProgress } from "@mui/material";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Services
import authService from "services/authService";

// Images
// import bgImage from "assets/images/tcf-canada-background.svg";
const bgImage = "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; //  URL de l'image de fond

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { loadUserInfo } = useInfoUser();
  useEffect(() => {
    const completeRegistration = async () => {
      try {
        // Récupérer les paramètres de l'URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get("session_id");
        const planName = params.get("plan");
        
        if (!sessionId) {
          setError("ID de session manquant. Impossible de vérifier le paiement.");
          setLoading(false);
          return;
        }
        
        // Vérifier si l'utilisateur est déjà connecté
        const token = localStorage.getItem("token");
        const userInfo = localStorage.getItem("user_info");
        const isLoggedIn = token && userInfo;
        
        // Vérifier le statut du paiement
        try {
          const verifyResponse = await fetch("http://localhost:5001/stripe/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { "Authorization": `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ session_id: sessionId })
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.status !== "success") {
            setError("Le paiement n'a pas été confirmé. Veuillez réessayer.");
            setLoading(false);
            return;
          }
        } catch (verifyError) {
          console.error("Erreur lors de la vérification du paiement:", verifyError);
          // Continuer malgré l'erreur de vérification pour le développement
          // Pour le développement, on continue même si la vérification échoue
          console.log("Poursuite du processus malgré l'erreur de vérification (mode développement)");
        }
        
        // Vérifier si c'est un utilisateur existant (upgrade) ou un nouvel utilisateur
        if (isLoggedIn) {
          // Utilisateur existant - mise à jour du plan seulement
          console.log("Utilisateur existant détecté - mise à jour du plan");
          
          try {
            // Recharger les informations utilisateur après la mise à jour du plan
            await loadUserInfo(true); // Forcer le refresh depuis l'API
            setSuccess(true);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Erreur lors du rechargement des informations utilisateur:", error);
            setError("Erreur lors de la mise à jour de votre profil. Veuillez vous reconnecter.");
            setLoading(false);
            return;
          }
        }
        
        // Nouvel utilisateur - processus d'inscription complet
        const storedData = localStorage.getItem("signupData");
        
        if (!storedData) {
          setError("Aucune donnée d'inscription trouvée. Veuillez retourner à la page d'inscription.");
          setLoading(false);
          return;
        }
        
        // Récupérer les données du formulaire
        const userData = JSON.parse(storedData);
        
        // Récupérer les informations du plan à partir de l'URL ou de la session Stripe
        // Pour le développement, on utilise les informations de la session
        try {
          // Récupérer le plan à partir de la session Stripe (si disponible)
          const planInfo = params.get("plan") || "standard"; // Par défaut, on utilise le plan standard
          
          // Ajouter les informations du plan aux données utilisateur
          userData.plan = planInfo;
          console.log("Données utilisateur avec plan:", userData);

          
          
          // Mettre à jour les données dans localStorage (pour référence future)
          localStorage.setItem("signupData", JSON.stringify(userData));
        } catch (planError) {
          console.error("Erreur lors de la récupération des informations du plan:", planError);
          // Continuer sans les informations du plan
        }
        
        // Envoyer les données au backend pour finaliser l'inscription
        const response = await authService.signup(userData);
        
        if (response.data) {
          setSuccess(true);
          // Nettoyer les données stockées
          localStorage.removeItem("signupData");

          const response = await fetch("http://localhost:5001/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              username: userData.username, // Le backend accepte maintenant username ou email
              password: userData.password
            })
          });
          
          const data = await response.json();
          
          if (data.access_token) {
            // Stocker le token dans localStorage
            localStorage.setItem("token", data.access_token);
            console.log(data.access_token)
            
            // Stocker les informations utilisateur si disponibles
            if (data.user_info) {
              localStorage.setItem("user_info", JSON.stringify(data.user_info));
              console.log("Informations utilisateur stockées:", data.user_info);
            }

            await loadUserInfo(true); // Forcer le refresh depuis l'API 
          }


        }
      } catch (error) {
        console.error("Erreur lors du traitement du paiement:", error);
        setError(error.response?.data?.message || "Une erreur est survenue lors du traitement de votre paiement.");
      } finally {
        setLoading(false);
      }
    };
    
    completeRegistration();
  }, [location.search, navigate]);

  const handleGoToDashboard = () => {

    navigate("/dashboard");
  };

  return (
    <CoverLayout image={bgImage}>
      <Card sx={{
        maxWidth: 500,
        width: "100%",
        mx: "auto",
        overflow: "visible",
        borderRadius: 3,
        boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)"
      }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
          sx={{
            background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
            boxShadow: "0 12px 20px -10px rgba(0, 123, 255, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(0, 123, 255, 0.2)",
          }}
        >
          <MDTypography variant="h4" fontWeight="bold" color="white">
            Réussir TCF Canada
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3} textAlign="center">
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress color="info" />
              <MDTypography variant="body1" color="text" ml={2}>
                Finalisation de votre inscription...
              </MDTypography>
            </Box>
          ) : error ? (
            <>
              <MDTypography variant="h5" fontWeight="medium" color="error" mb={2}>
                Erreur
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={4}>
                {error}
              </MDTypography>
              <MDButton 
                variant="contained" 
                color="info" 
                onClick={() => navigate("/authentication/sign-up")}
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
                  borderRadius: '30px',
                  boxShadow: '0 4px 20px 0 rgba(0,123,255,.25)',
                  height: '3rem',
                  fontSize: '1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
                    boxShadow: '0 6px 25px 0 rgba(0,123,255,.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all .2s ease-in-out',
                }}
              >
                Retour à l'inscription
              </MDButton>
            </>
          ) : (
            <>
              <Grid container spacing={3} justifyContent="center">
                <Grid item xs={12}>
                  <MDTypography variant="h5" fontWeight="medium" color="success" mb={1}>
                    Paiement réussi !
                  </MDTypography>
                  <MDTypography variant="body1" color="text" mb={1}>
                    Votre inscription et votre abonnement ont été finalisés avec succès.
                  </MDTypography>
                  <MDTypography variant="body1" color="text" mb={4}>
                    Vous pouvez maintenant accéder à votre tableau de bord pour commencer à utiliser nos services.
                  </MDTypography>
                </Grid>
              </Grid>
              <MDButton 
                variant="contained" 
                color="info" 
                onClick={handleGoToDashboard}
                fullWidth
                sx={{ 
                  background: 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
                  borderRadius: '30px',
                  boxShadow: '0 4px 20px 0 rgba(0,123,255,.25)',
                  height: '3.5rem',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
                    boxShadow: '0 6px 25px 0 rgba(0,123,255,.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all .2s ease-in-out',
                }}
              >
                Se connecter
              </MDButton>
            </>
          )}
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default PaymentSuccess;