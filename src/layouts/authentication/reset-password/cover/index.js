/**
=========================================================
* Simulateur TCF Canada React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import LoginIcon from "@mui/icons-material/Login";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import logoTCF from "assets/logo-tfc-canada.png";
import { API_BASE_URL } from "services/config";

const bgImage = "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";

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
          navigate('/authentication/sign-in');
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
              {token ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
            </MDTypography>
            <MDTypography variant="body2" color="white" mt={1} sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              {token 
                ? 'Créez un nouveau mot de passe sécurisé' 
                : 'Recevez un lien de réinitialisation par email'
              }
            </MDTypography>
          </MDBox>
          
          {!token ? (
            // Formulaire de demande de réinitialisation
            <MDBox component="form" role="form" onSubmit={handleForgotPassword}>
              <MDBox mb={2}>
                <MDInput 
                  type="email" 
                  label="Adresse email" 
                  fullWidth 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
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
              <MDBox mt={4} mb={1}>
                <MDButton 
                  variant="gradient" 
                  color="primary" 
                  fullWidth 
                  type="submit"
                  startIcon={<EmailIcon />}
                  disabled={isLoading}
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
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="white" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  Vous vous souvenez de votre mot de passe?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in"
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
                    Se connecter
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          ) : (
            // Formulaire de réinitialisation avec token
            <MDBox component="form" role="form" onSubmit={handleResetPassword}>
              <MDBox mb={2}>
                <MDInput 
                  type={showPassword ? "text" : "password"}
                  label="Nouveau mot de passe" 
                  fullWidth 
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
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirmer le mot de passe" 
                  fullWidth 
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
              <MDBox mt={4} mb={1}>
                <MDButton 
                  variant="gradient" 
                  color="primary" 
                  fullWidth 
                  type="submit"
                  startIcon={<LockResetIcon />}
                  disabled={isLoading}
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
                  {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
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
                  Retour à la connexion
                </MDTypography>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
      </Card>
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={8000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={messageType} 
          sx={{ 
            width: '100%',
            minWidth: '400px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
            border: messageType === 'success' ? '1px solid rgba(77, 214, 82, 0.3)' : '1px solid rgba(244, 67, 54, 0.3)',
            background: messageType === 'success' 
              ? 'linear-gradient(135deg, rgba(100, 197, 103, 0.9) 0%, rgba(139, 195, 74, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(229, 57, 53, 0.9) 100%)',
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            '& .MuiAlert-icon': {
              fontSize: '24px',
              color: 'white'
            },
            '& .MuiAlert-action': {
              color: 'white'
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </BasicLayout>
  );
}

export default Cover;
