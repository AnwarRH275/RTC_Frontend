/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// @mui material components
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Checkbox, 
  FormControlLabel, 
  Typography,
  Alert,
  Snackbar,
  Card
} from "@mui/material";

// Custom components
import OfficialHeader from "components/OfficialHeader";
import OfficialFooter from "components/OfficialFooter";
import logoTCF from "assets/logo-tfc-canada.png";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";

// Services
import authService from "services/authService";
import { useInfoUser } from "context/InfoUserContext";

// Background images
const bgImages = [
  "/img_bg1.jpeg",
"/img_bg2.jpeg",
"/img_bg3.jpg"
];

function Basic() {
  const navigate = useNavigate();
  const { loadUserInfo } = useInfoUser();
  const [rememberMe, setRememberMe] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animation pour changer l'image d'arrière-plan
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === bgImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change d'image toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    if (!usernameOrEmail || !password) {
      setError("Veuillez remplir tous les champs");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    
    try {
      const response = await authService.login({
        username: usernameOrEmail,
        password: password,
      });
      
      if (response.data.access_token) {
        await loadUserInfo(true);
        navigate("/mon-espace-tcf");
      } else {
        setError(response.data.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setError(error.message || "Échec de la connexion. Veuillez vérifier vos identifiants.");
      setOpenSnackbar(true);
      console.error("Erreur de connexion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${bgImages[currentImageIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        transition: "background-image 1s ease-in-out",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 1
        }
      }}
    >
      {/* Header officiel */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <OfficialHeader />
      </Box>
      
      {/* Contenu principal centré */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 4,
          position: "relative",
          zIndex: 2
        }}
      >
        <Card
          sx={{
            maxWidth: "480px",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.62)",
            backdropFilter: "blur(15px)",
            borderRadius: { xs: 12, sm: 16 },
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            p: { xs: 2, sm: 4 },
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)"
          }}
        >
          {/* Logo et titre */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
              <Box
                component="img"
                src={logoTCF}
                alt="TCF Canada"
                sx={{ height: { xs: 90, sm: 120 }, width: 'auto', mr: 1 }}
              />
            </Box>
          </Box>

          {/* Formulaire */}
          <Box component="form" onSubmit={handleSignIn} sx={{ textAlign: "left" }}>
            <MDBox sx={{ mb: 2 }}>
              <MDInput
                fullWidth
                variant="outlined"
                placeholder="Nom d'utilisateur ou email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    minHeight: { xs: '40px', sm: '44px' },
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(79, 204, 231, 0.8)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(79, 204, 231, 1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  },
                }}
              />
            </MDBox>

            <MDBox sx={{ mb: 2 }}>
              <MDInput
                fullWidth
                type="password"
                variant="outlined"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    minHeight: { xs: '40px', sm: '44px' },
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(79, 204, 231, 0.8)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(79, 204, 231, 1)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  },
                }}
              />
            </MDBox>

            {/* Checkbox et lien (unique) */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, fontSize: "0.9rem" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  size="small"
                  sx={{
                    color: "#4fccE7",
                    '&.Mui-checked': {
                      color: "#4fccE7",
                    },
                    p: 0
                  }}
                />
                <Typography variant="body2" sx={{ color: "#000000", fontSize: "0.875rem", lineHeight: 1 }}>
                  Se souvenir de moi
                </Typography>
              </Box>
            </Box>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: "#4fccE7",
                  color: "#000000",
                  py: 1.5,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: "bold",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  mb: 3,
                  boxShadow: "0 6px 20px rgba(79, 204, 231, 0.35)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "#3C3C3C",
                    color: "#ffffff",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 24px rgba(60, 60, 60, 0.45)"
                  },
                  "&:active": {
                    transform: "translateY(0)"
                  },
                  "&:disabled": {
                    background: "#ccc",
                    boxShadow: "none"
                  }
              }}
            >
              {loading ? "Connexion en cours..." : "SE CONNECTER"}
            </Button>

            {/* Liens bas: à gauche reset, à droite inscription */}
            <Box sx={{ display: "flex", justifyContent: { xs: "center", sm: "space-between" }, alignItems: "center", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 1, sm: 0 }, fontSize: "0.9rem" }}>
              <Typography component={Link} to="/reset-password" variant="body2" sx={{ 
                color: "#000000", 
                textDecoration: "none", 
                fontSize: "0.9rem", 
                fontWeight: "500",
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
                "&:hover": { 
                  textDecoration: "underline",
                  color: "#ffffff"
                } 
              }}>
                Mot de passe oublié ?
              </Typography>
              <Typography component={Link} to="/inscription-tcf" variant="body2" sx={{ 
                color: "#000000", 
                textDecoration: "none", 
                fontSize: "0.9rem", 
                fontWeight: "500",
                textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
                "&:hover": { 
                  textDecoration: "underline",
                  color: "#ffffff"
                } 
              }}>
                Vous n'avez pas de compte ? S'inscrire
              </Typography>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Footer officiel */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <OfficialFooter />
      </Box>

      {/* Snackbar pour les erreurs */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Basic;
