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
import { API_BASE_URL } from '../../../services/config';

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

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
        const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const MAX_VERIFY_ATTEMPTS = 4;
        const VERIFY_RETRY_DELAY_MS = 1500;

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
        
        // Vérifier le statut du paiement (avec retries si en attente)
        let verifyData = null;
        try {
          for (let attempt = 1; attempt <= MAX_VERIFY_ATTEMPTS; attempt += 1) {
            const verifyResponse = await fetch(`${API_BASE_URL}/stripe/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ session_id: sessionId })
            });
            
            const data = await verifyResponse.json();
            if (!verifyResponse.ok) {
              throw new Error(data?.error || data?.message || "Erreur lors de la vérification du paiement.");
            }

            verifyData = data;

            if (verifyData.status === "success") {
              break;
            }

            if (verifyData.status !== "pending") {
              break;
            }

            if (attempt < MAX_VERIFY_ATTEMPTS) {
              await wait(VERIFY_RETRY_DELAY_MS);
            }
          }
        } catch (verifyError) {
          console.error("Erreur lors de la vérification du paiement:", verifyError);
          setError(verifyError.message || "Impossible de vérifier le paiement pour le moment.");
          setLoading(false);
          return;
        }

        if (!verifyData || verifyData.status !== "success") {
          const fallbackMessage = "Le paiement est en attente de confirmation. Veuillez réessayer dans quelques instants.";
          setError(verifyData?.message || fallbackMessage);
          setLoading(false);
          return;
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
        
        // Nouvel utilisateur - finaliser via connexion (compte déjà créé avant paiement)
        const storedData = localStorage.getItem("signupData");

        if (!storedData) {
          setError("Aucune donnée d'inscription trouvée. Veuillez retourner à la page d'inscription.");
          setLoading(false);
          return;
        }

        // Récupérer les données du formulaire
        const userData = JSON.parse(storedData);

        // Récupérer les informations du plan à partir de l'URL ou de la session Stripe
        try {
          const planInfo = planName || "standard";
          userData.plan = planInfo;
          console.log("Données utilisateur avec plan:", userData);
          localStorage.setItem("signupData", JSON.stringify(userData));
        } catch (planError) {
          console.error("Erreur lors de la récupération des informations du plan:", planError);
        }

        // Se connecter après paiement confirmé
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: userData.username,
            password: userData.password
          })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok && loginData.access_token) {
          localStorage.setItem("token", loginData.access_token);
          if (loginData.user_info) {
            localStorage.setItem("user_info", JSON.stringify(loginData.user_info));
          }
          localStorage.removeItem("signupData");
          await loadUserInfo(true);
          setSuccess(true);
          setLoading(false);
          return;
        }

        // Fallback: si le compte n'existe pas (ancien flux), tenter une création puis connexion
        if (loginResponse.status === 404) {
          const signupResponse = await authService.signup(userData);
          if (signupResponse?.data) {
            const retryLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                username: userData.username,
                password: userData.password
              })
            });

            const retryLoginData = await retryLoginResponse.json();
            if (retryLoginResponse.ok && retryLoginData.access_token) {
              localStorage.setItem("token", retryLoginData.access_token);
              if (retryLoginData.user_info) {
                localStorage.setItem("user_info", JSON.stringify(retryLoginData.user_info));
              }
              localStorage.removeItem("signupData");
              await loadUserInfo(true);
              setSuccess(true);
              setLoading(false);
              return;
            }
          }
        }

        setError(loginData?.message || "Votre paiement est confirmé, mais la connexion a échoué. Veuillez vous connecter.");
        setLoading(false);
        return;
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

    navigate("/mon-espace-tcf");
  };

  // Hauteur du header estimée à 80px (ajustez si besoin)
  const HEADER_HEIGHT = 80;
  return (
    <BasicLayout image={bgImage}>
      <MDBox
        sx={{
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingTop: `${HEADER_HEIGHT}px`,
        }}
      >
        <Card sx={{
          width: "100%",
          maxWidth: 500,
          mx: "auto",
          borderRadius: 2,
          boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)",
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          WebkitBackdropFilter: "blur(15px)",
          position: "relative",
          zIndex: 2
        }}>
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
                  onClick={() => navigate("/inscription-tcf")}
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
              <MDBox display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
                <MDTypography variant="h5" fontWeight="medium" color="success" mb={1} textAlign="center">
                  Paiement réussi !
                </MDTypography>
                <MDTypography variant="body1" color="text" mb={1} textAlign="center">
                  Votre inscription et votre abonnement ont été finalisés avec succès.
                </MDTypography>
                <MDTypography variant="body1" color="text" mb={4} textAlign="center">
                  Vous pouvez maintenant accéder à votre tableau de bord pour commencer à utiliser nos services.
                </MDTypography>
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
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>
    </BasicLayout>
  );
}

export default PaymentSuccess;