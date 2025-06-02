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
const bgImage = "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; //  URL de l'image de fond

function Basic() {
  const navigate = useNavigate();
  const { loadUserInfo } = useInfoUser();
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      setError("Veuillez remplir tous les champs");
      setOpenSnackbar(true);
      return;
    }
    
    try {
      const response = await authService.login({
        username: usernameOrEmail,
        password: password,
      });
      
      if (response.data.access_token) {
        await loadUserInfo(); // Charger les informations utilisateur après une connexion réussie
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
      setOpenSnackbar(true);
      console.error("Erreur de connexion:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <BasicLayout image={bgImage}>
      <Card sx={{ borderRadius: 2, boxShadow: "0 8px 16px 0 rgba(0,0,0,0.2)" }}>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h3" fontWeight="medium" color="white" mt={1}>
            Réussir TCF Canada
          </MDTypography>
          <MDTypography variant="body2" color="white" mb={1}>
            Connectez-vous pour accéder à votre espace d'entraînement
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSignIn}>
            <MDBox mb={2}>
              <MDInput 
                type="text" 
                label="Nom d'utilisateur ou Email" 
                fullWidth 
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
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
              />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Se souvenir de moi
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton 
                variant="gradient" 
                color="info" 
                fullWidth 
                type="submit"
                startIcon={<LoginIcon />}
                sx={{ 
                  py: 1.5, 
                  transition: "all 0.3s",
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 10px rgba(0,0,0,0.2)'
                  } 
                }}
              >
                Connexion
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Vous n'avez pas de compte?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  S'inscrire
                </MDTypography>
              </MDTypography>
            </MDBox>
            <MDBox mt={2} textAlign="center">
              <MDTypography
                component={Link}
                to="#"
                variant="button"
                color="info"
                fontWeight="regular"
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
