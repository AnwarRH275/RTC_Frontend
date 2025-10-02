/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";

// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Box from "@mui/material/Box";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";
import LoginIcon from "@mui/icons-material/Login";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import authService from "services/authService";
import { useInfoUser } from "context/InfoUserContext";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
// import bgImage from "assets/images/bg-sign-in-modern.jpg";
import logoTCF from "assets/logo-tfc-canada.png";
const bgImage = "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; //  URL de l'image de fond

function Basic() {
  const navigate = useNavigate();
  const { loadUserInfo } = useInfoUser();
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      setError("Veuillez remplir tous les champs");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true); // Début du chargement
    
    try {
      const response = await authService.login({
        username: usernameOrEmail,
        password: password,
      });
      
      if (response.data.access_token) {
        await loadUserInfo(true); // Forcer le refresh depuis l'API après une connexion réussie
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
      setOpenSnackbar(true);
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ 
        borderRadius: 2, 
        boxShadow: "0 8px 32px 0 rgba(0,0,0,0.3)",
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        WebkitBackdropFilter: 'blur(15px)'
      }}>
        <MDBox pt={4} pb={3} px={3}>
          {/* Logo et titre intégrés directement dans le bloc principal */}
          <MDBox textAlign="center" mb={4}>
            <img src={logoTCF} alt="TCF Canada Logo" style={{ height: '110px', marginBottom: '16px' }} />
            <MDTypography variant="h4" fontWeight="medium" color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              Connexion à votre compte
            </MDTypography>
            <MDTypography variant="body2" color="white" mt={1} sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Accédez à votre préparation TCF Canada
            </MDTypography>
          </MDBox>
          <MDBox component="form" role="form" onSubmit={handleSignIn}>
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                label="Nom d'utilisateur ou Email" 
                fullWidth 
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(79, 204, 231, 0.5)',
                    '&:hover': {
                      borderColor: 'rgba(79, 204, 231, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                    '&.Mui-focused': {
                      borderColor: 'rgba(79, 204, 231, 1)',
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
            </MDBox>
            <MDBox mb={2}>
              <MDInput 
                type="password" 
                label="Mot de passe" 
                fullWidth 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(79, 204, 231, 0.5)',
                    '&:hover': {
                      borderColor: 'rgba(79, 204, 231, 0.8)',
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                    '&.Mui-focused': {
                      borderColor: 'rgba(79, 204, 231, 1)',
                      backgroundColor: 'rgba(255, 255, 255, 1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)',
                  },
                }}
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch 
                checked={rememberMe} 
                onChange={handleSetRememberMe}
                sx={{ 
                  color: 'rgba(79, 204, 231, 1)',
                  '&.Mui-checked': {
                    color: 'rgba(79, 204, 231, 1)',
                  },
                }}
              />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="white"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
              >
                &nbsp;&nbsp;Se souvenir de moi
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="primary" 
                fullWidth 
                type="submit"
                startIcon={<LoginIcon />}
                disabled={loading} // Désactiver le bouton pendant le chargement
                sx={{ 
                  py: 1.5, 
                  transition: "all 0.3s",
                  background: "linear-gradient(to right, rgba(79, 204, 231, 1), #0083b0)",
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                    background: "#0083b0"
                  } 
                }}
              >
                {loading ? "Connexion en cours..." : "Connexion"} 
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                Pas encore de compte?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="primary"
                  fontWeight="medium"
                  textGradient
                  sx={{
                    color: 'rgb(255, 255, 255)',
                    textShadow: '0 1px 2px rgba(138, 136, 136, 0.3)',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.8)',
                    }
                  }}
                >
                  Créer un compte
                </MDTypography>
              </MDTypography>
            </MDBox>
            <MDBox mt={2} textAlign="center">
              <MDTypography
                component={Link}
                to="/authentication/reset-password/cover"
                variant="button"
                color="primary"
                fontWeight="regular"
                sx={{ 
                  color: 'rgb(252, 252, 252)', 
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.18)',
                  '&:hover': {
                    color: 'rgb(255, 255, 255)',
                  }
                }}
              >
                Mot de passe oublié?
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </BasicLayout>
  );
}

export default Basic;
