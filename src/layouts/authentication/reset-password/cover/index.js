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

// @mui material components
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Slide from "@mui/material/Slide";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-reset-cover.jpeg";
import { API_BASE_URL } from "services/config";

function Cover() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  // États pour le formulaire de demande de réinitialisation
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
  
  // États pour le formulaire de réinitialisation avec token
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formAnimation, setFormAnimation] = useState(true);
  
  // Fonction pour demander une réinitialisation de mot de passe
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Veuillez saisir votre adresse email');
      setMessageType('error');
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
        setMessage(data.message);
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(data.message || 'Une erreur est survenue');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
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
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      setMessageType('error');
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage('Le mot de passe doit contenir au moins 6 caractères');
      setMessageType('error');
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
        setTimeout(() => {
          navigate('/authentication/sign-in');
        }, 2000);
      } else {
        setMessage(data.message || 'Une erreur est survenue');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erreur de connexion au serveur');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <CoverLayout image={bgImage}>
      <Fade in={formAnimation} timeout={800}>
        <Card
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
            borderRadius: "16px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.95)",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
            },
          }}
        >
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          py={3}
          mb={1}
          textAlign="center"
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "shimmer 2s infinite",
            },
            "@keyframes shimmer": {
              "0%": { left: "-100%" },
              "100%": { left: "100%" },
            },
          }}
        >
          <MDBox sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
            {token ? <LockResetIcon sx={{ fontSize: 32, mr: 1 }} /> : <EmailIcon sx={{ fontSize: 32, mr: 1 }} />}
            <MDTypography variant="h3" fontWeight="medium" color="white">
              {token ? 'Nouveau mot de passe' : 'Mot de passe oublié'}
            </MDTypography>
          </MDBox>
          <MDTypography display="block" variant="button" color="white" sx={{ opacity: 0.9 }}>
            {token 
              ? 'Créez un nouveau mot de passe sécurisé' 
              : 'Recevez un lien de réinitialisation par email'
            }
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          {message && (
            <MDBox mb={2}>
              <Alert severity={messageType}>
                {message}
              </Alert>
            </MDBox>
          )}
          
          {!token ? (
            // Formulaire de demande de réinitialisation
            <Slide direction="up" in={!token} timeout={600}>
              <MDBox component="form" role="form" onSubmit={handleForgotPassword}>
                <MDBox mb={4}>
                  <MDInput 
                    type="email" 
                    label="Adresse email" 
                    variant="outlined" 
                    fullWidth 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        },
                      },
                    }}
                  />
                </MDBox>
                <MDBox mt={6} mb={1}>
                  <MDButton 
                    variant="gradient" 
                    color="info" 
                    fullWidth
                    type="submit"
                    disabled={isLoading}
                    sx={{
                      borderRadius: "12px",
                      py: 1.5,
                      fontSize: "16px",
                      fontWeight: "600",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                      },
                      "&:disabled": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? (
                      <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Envoi en cours...</span>
                      </MDBox>
                    ) : (
                      <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon />
                        <span>Envoyer le lien de réinitialisation</span>
                      </MDBox>
                    )}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Slide>
          ) : (
            // Formulaire de réinitialisation avec token
            <Slide direction="up" in={!!token} timeout={600}>
              <MDBox component="form" role="form" onSubmit={handleResetPassword}>
                <MDBox mb={4}>
                  <MDInput 
                    type={showPassword ? "text" : "password"}
                    label="Nouveau mot de passe" 
                    variant="outlined" 
                    fullWidth 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockResetIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        },
                      },
                    }}
                  />
                </MDBox>
                <MDBox mb={4}>
                  <MDInput 
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirmer le mot de passe" 
                    variant="outlined" 
                    fullWidth 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockResetIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        },
                      },
                    }}
                  />
                </MDBox>
                <MDBox mt={6} mb={1}>
                  <MDButton 
                    variant="gradient" 
                    color="info" 
                    fullWidth
                    type="submit"
                    disabled={isLoading}
                    sx={{
                      borderRadius: "12px",
                      py: 1.5,
                      fontSize: "16px",
                      fontWeight: "600",
                      textTransform: "none",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                      },
                      "&:disabled": {
                        opacity: 0.7,
                      },
                    }}
                  >
                    {isLoading ? (
                      <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CircularProgress size={20} color="inherit" />
                        <span>Réinitialisation...</span>
                      </MDBox>
                    ) : (
                      <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LockResetIcon />
                        <span>Réinitialiser le mot de passe</span>
                      </MDBox>
                    )}
                  </MDButton>
                </MDBox>
              </MDBox>
            </Slide>
          )}
        </MDBox>
        </Card>
      </Fade>
    </CoverLayout>
  );
}

export default Cover;
