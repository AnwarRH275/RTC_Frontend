/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Card,
  IconButton,
  InputAdornment
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";

// Custom components
import OfficialHeader from "components/OfficialHeader";
import OfficialFooter from "components/OfficialFooter";
import logoTCF from "assets/logo-tfc-canada.png";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDInput from "components/MDInput";

// Services
import { API_BASE_URL } from "services/config";

// Background images
const bgImages = [
  "/img_bg1.jpeg",
"/img_bg2.jpeg",
"/img_bg3.jpg"
];

function Cover() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  // États pour le formulaire de demande de réinitialisation
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // États pour le formulaire de réinitialisation avec token
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // Fonction pour demander une réinitialisation de mot de passe
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Veuillez saisir votre adresse email');
      setMessageType('error');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Si cet email existe, un lien de réinitialisation a été envoyé à votre adresse email. Vérifiez votre boîte de réception et vos spams.');
        setMessageType('success');
        setEmail('');
        setOpenSnackbar(true);
      } else {
        setMessage(data.message || 'Une erreur est survenue');
        setMessageType('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour réinitialiser le mot de passe avec le token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage('Veuillez remplir tous les champs');
      setMessageType('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setMessageType('error');
      setOpenSnackbar(true);
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      setMessageType('error');
      setOpenSnackbar(true);
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Mot de passe réinitialisé avec succès ! Redirection vers la connexion...');
        setMessageType('success');
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate('/connexion-tcf');
        }, 2000);
      } else {
        setMessage(data.message || 'Une erreur est survenue');
        setMessageType('error');
        setOpenSnackbar(true);
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundImage: `url(${bgImages[currentImageIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "background-image 1s ease-in-out",
        "&::before": {
          content: '""',
          position: "absolute",
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
                sx={{ height: { xs: 90, sm: 120, md: 140 }, width: 'auto', mr: 1 }}
              />
            </Box>
          </Box>
          
          {!token ? (
            // Formulaire de demande de réinitialisation
            <Box component="form" onSubmit={handleForgotPassword} sx={{ textAlign: "left" }}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: "center", color: "#333", fontWeight: "bold", fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Mot de passe oublié
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "#000000" }}>
                Recevez un lien de réinitialisation par email
              </Typography>
              
              <MDBox sx={{ mb: 2 }}>
                <MDInput
                  fullWidth
                  type="email"
                  variant="outlined"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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

              {/* Bouton d'envoi */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={<EmailIcon />}
                sx={{
                  backgroundColor: "#4fccE7",
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
                    backgroundColor: "#3C3C3C",
                    color: "#ffffff",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)"
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
                {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
              </Button>

              {/* Lien retour connexion */}
              <Box sx={{ textAlign: "center" }}>
                <Typography component={Link} to="/connexion-tcf" variant="body2" sx={{ 
                  color: "#000000", 
                  textDecoration: "none", 
                  fontSize: "0.9rem", 
                  fontWeight: "500",
                  textShadow: "0 1px 2px rgba(255, 255, 255, 0.3)",
                  "&:hover": { 
                    textDecoration: "underline",
                    color: "#000000"
                  } 
                }}>
                  Vous vous souvenez de votre mot de passe ? Se connecter
                </Typography>
              </Box>
            </Box>
          ) : (
            // Formulaire de réinitialisation avec token
            <Box component="form" onSubmit={handleResetPassword} sx={{ textAlign: "left" }}>
              <Typography variant="h5" sx={{ mb: 2, textAlign: "center", color: "#333", fontWeight: "bold", fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                Nouveau mot de passe
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, textAlign: "center", color: "#666" }}>
                Créez un nouveau mot de passe sécurisé
              </Typography>
              
              <MDBox sx={{ mb: 2 }}>
                <MDInput
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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

              {/* Bouton de réinitialisation */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                startIcon={<LockResetIcon />}
                sx={{
                  background: "linear-gradient(90deg, #4fccE7 0%, #3bb3d0 100%)",
                  color: "white",
                  py: 1.5,
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  fontWeight: "bold",
                  borderRadius: "999px",
                  textTransform: "uppercase",
                  mb: 3,
                  boxShadow: "0 6px 20px rgba(79, 204, 231, 0.35)",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    background: "linear-gradient(90deg, #3bb3d0 0%, #2ea3c0 100%)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 24px rgba(79, 204, 231, 0.45)"
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
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </Button>

              {/* Lien retour connexion */}
              <Box sx={{ textAlign: "center" }}>
                <Typography component={Link} to="/connexion-tcf" variant="body2" sx={{ 
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
                  Retour à la connexion
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Box>

      {/* Footer officiel */}
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <OfficialFooter />
      </Box>

      {/* Snackbar pour les erreurs */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={messageType} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Cover;
