/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

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
  Stepper, 
  Step, 
  StepLabel, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  InputAdornment, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { Visibility, VisibilityOff, Close as CloseIcon } from "@mui/icons-material";

// Custom components
import OfficialHeader from "components/OfficialHeader";
import OfficialFooter from "components/OfficialFooter";
import logoTcfCanada from "assets/logo-tfc-canada.png";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Services
import authService from "services/authService";
import SubscriptionPlans from "./SubscriptionPlans";
import { API_BASE_URL } from '../../../services/config';

// Background images
const bgImages = [
  "/img_bg1.jpeg",
"/img_bg2.jpeg",
"/img_bg3.jpg"
];

function Cover() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");
  const [tel, setTel] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openTerms, setOpenTerms] = useState(false);

  const handleOpenTerms = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setOpenTerms(true);
  };

  const handleCloseTerms = () => {
    setOpenTerms(false);
  };

  const handleAcceptTerms = () => {
    setAgreeTerms(true);
    setOpenTerms(false);
  };

  // Animation pour changer l'image d'arrière-plan
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === bgImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change d'image toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  // Vérifier si l'utilisateur vient du bouton "upgrade to pro"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const upgradeParam = params.get('upgrade');
    
    if (upgradeParam === 'pro') {
      // Passer directement à l'étape de sélection de plan
      setActiveStep(1);
      // Pré-sélectionner le plan Pro (sera fait dans SubscriptionPlans)
    }

    // Gérer le retour d'annulation Stripe : supprimer le compte pending
    const cancelled = params.get('cancelled');
    const cancelledUserId = params.get('userId');
    if (cancelled === 'true' && cancelledUserId) {
      // Supprimer le compte pending côté backend
      fetch(`${API_BASE_URL}/stripe/cancel-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(cancelledUserId, 10) })
      })
        .then(res => res.json())
        .then(data => {
          console.log("Compte pending nettoyé après annulation Stripe:", data);
        })
        .catch(err => {
          console.warn("Erreur lors du nettoyage du compte pending:", err);
        });

      // Restaurer les champs du formulaire depuis localStorage
      const storedData = localStorage.getItem("signupData");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.username) setUsername(parsed.username);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.password) setPassword(parsed.password);
          if (parsed.nom) setNom(parsed.nom);
          if (parsed.prenom) setPrenom(parsed.prenom);
          if (parsed.tel) {
            // Séparer l'indicatif du numéro
            const parts = parsed.tel.split(' ');
            if (parts.length >= 2) {
              setCountryCode(parts[0]);
              setTel(parts.slice(1).join(' '));
            } else {
              setTel(parsed.tel);
            }
          }
        } catch (e) {
          console.warn("Impossible de restaurer les données d'inscription:", e);
        }
      }

      // Nettoyer les tokens et infos stockés lors de la création du compte
      localStorage.removeItem('token');
      localStorage.removeItem('user_info');

      // Afficher un message à l'utilisateur
      setError("Le paiement a été annulé. Vous pouvez réessayer avec le même email.");
      setOpenSnackbar(true);

      // Nettoyer l'URL
      window.history.replaceState({}, document.title, '/inscription-tcf');
    }
  }, [location.search]);

  const steps = ['Informations personnelles', 'Choisir un plan'];

  const countryCodes = [
    { code: "+1", country: "Canada/USA", flag: "🇨🇦" },
    { code: "+33", country: "France", flag: "🇫🇷" },
    { code: "+32", country: "Belgique", flag: "🇧🇪" },
    { code: "+41", country: "Suisse", flag: "🇨🇭" },
    { code: "+44", country: "Royaume-Uni", flag: "🇬🇧" },
    { code: "+49", country: "Allemagne", flag: "🇩🇪" },
    { code: "+34", country: "Espagne", flag: "🇪🇸" },
    { code: "+39", country: "Italie", flag: "🇮🇹" },
    { code: "+351", country: "Portugal", flag: "🇵🇹" },
    { code: "+212", country: "Maroc", flag: "🇲🇦" },
    { code: "+213", country: "Algérie", flag: "🇩🇿" },
    { code: "+216", country: "Tunisie", flag: "🇹🇳" },
    { code: "+225", country: "Côte d'Ivoire", flag: "🇨🇮" },
    { code: "+221", country: "Sénégal", flag: "🇸🇳" },
    { code: "+237", country: "Cameroun", flag: "🇨🇲" },
    { code: "+20", country: "Égypte", flag: "🇪🇬" },
    { code: "+234", country: "Nigeria", flag: "🇳🇬" },
    { code: "+233", country: "Ghana", flag: "🇬🇭" },
    { code: "+971", country: "Émirats arabes unis", flag: "🇦🇪" },
    { code: "+966", country: "Arabie saoudite", flag: "🇸🇦" },
  ];

  const handleNext = () => {
    if (activeStep === 0) {
      // Validation des champs du formulaire
      if (!username || !email || !password || !confirmPassword || !tel || !nom || !prenom) {
        setError("Veuillez remplir tous les champs.");
        setOpenSnackbar(true);
        return;
      }
      const emailRegex = /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/;
      if (!emailRegex.test(email)) {
        setError("Veuillez entrer une adresse email valide.");
        setOpenSnackbar(true);
        return;
      }
      if (tel.length < 7) { // Minimum 7 chiffres pour un numéro de téléphone
        setError("Veuillez entrer un numéro de téléphone valide (au moins 7 chiffres).");
        setOpenSnackbar(true);
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        setOpenSnackbar(true);
        return;
      }
      if (!agreeTerms) {
        setError("Veuillez accepter les conditions d'utilisation.");
        setOpenSnackbar(true);
        return;
      }
      
      // Stocker les données du formulaire dans localStorage avant de passer à l'étape suivante
      const formData = {
        id: `user_${Date.now()}`, // Créer un ID temporaire
        username: username,
        email: email,
        password: password,
        nom: nom,
        prenom: prenom,
        tel: countryCode +' '+ tel,
        plan: selectedPlan?.id || null,
        sold: selectedPlan?.sold || 0,
      };
      
      localStorage.setItem("signupData", JSON.stringify(formData));
      console.log("Données d'inscription sauvegardées dans localStorage:", formData);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Icône personnalisée pour le Stepper avec sélection inversée (accent sur l'étape non active)
  const InverseStepIcon = ({ active }) => {
    return (
      <Box sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        background: active
          ? 'rgba(255, 255, 255, 0.95)'
          : 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
        boxShadow: active
          ? 'inset 0 0 0 2px rgba(79, 204, 231, 0.6)'
          : '0 4px 12px rgba(0, 123, 255, 0.35)',
        border: active
          ? '2px solid rgba(79, 204, 231, 0.7)'
          : '2px solid rgba(255, 255, 255, 0.7)'
      }}>
        <Box sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: active ? 'rgba(79, 204, 231, 0.9)' : 'white'
        }} />
      </Box>
    );
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
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative"
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
          px: activeStep === 1 ? 1 : 2,
          py: 4,
          position: "relative",
          zIndex: 2,
          minHeight: "calc(100vh - 80px)" // Assure une hauteur minimale pour permettre le scroll de page
        }}
      >
        <Card
           sx={{
             maxWidth: activeStep === 1 ? "98%" : "800px",
             width: activeStep === 1 ? "98%" : "100%",
             backgroundColor: "rgba(255, 255, 255, 0.62)",
             backdropFilter: "blur(15px)",
             borderRadius: "16px",
             boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
             p: activeStep === 1 ? 2 : 3,
             textAlign: "center",
             border: "1px solid rgba(255, 255, 255, 0.2)",
             transition: "all 0.3s ease-in-out",
             // Suppression des propriétés maxHeight et overflowY pour permettre le scroll de page
             '@media (max-width: 1280px)': {
               maxWidth: activeStep === 1 ? "99%" : "90%",
               width: activeStep === 1 ? "99%" : "95%",
             },
             '@media (max-width: 768px)': {
               width: "95%",
               maxWidth: "95%",
               p: 2,
             },
             '@media (max-width: 480px)': {
               width: "98%",
               maxWidth: "98%",
               p: 1.5,
             }
           }}
         >
        <MDBox pt={1} pb={1} px={2} sx={{
          '@media (max-width: 768px)': {
            px: 1.5,
            pt: 0.5,
            pb: 0.5,
          }
        }}>
          {/* Logo TCF Canada mis en évidence */}
          <MDBox display="flex" justifyContent="center" mb={activeStep === 1 ? 0.5 : 1.5} sx={{
            position: 'relative',
            '@media (max-width: 768px)': {
              mb: activeStep === 1 ? 0.25 : 1,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: activeStep === 1 ? '60px' : '80px',
              height: activeStep === 1 ? '100px' : '150px',
              background: 'radial-gradient(circle, rgba(79, 204, 231, 0.3) 0%, rgba(79, 204, 231, 0.1) 50%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }
          }}>
            <Box
              component="img"
              src={logoTcfCanada}
              alt="TCF Canada Logo"
              sx={{
                height: activeStep === 1 ? { xs: '56px', sm: '72px' } : { xs: '90px', sm: '110px' },
                width: 'auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                position: 'relative',
                zIndex: 1,
                transition: 'all 0.3s ease-in-out'
              }}
            />
          </MDBox>
          
          {/* Titre et sous-titre optimisés */}
          <MDBox textAlign="center" mb={1} sx={{
            '@media (max-width: 768px)': {
              mb: 0.5,
            }
          }}>
            <MDBox display="flex" alignItems="center" justifyContent="center" mb={0.5} sx={{
              '@media (max-width: 768px)': {
                mb: 0.25,
              }
            }}>
              <MDTypography variant="h5" fontWeight="bold" color="dark" sx={{ 
                textShadow: 'none',
                '@media (max-width: 768px)': {
                  variant: 'h6',
                  fontSize: '1.1rem',
                },
                '@media (max-width: 480px)': {
                  fontSize: '1rem',
                }
              }}>
                Votre Coach TCF : Expression Écrite & Orale
              </MDTypography>
            </MDBox>
            <MDTypography display="block" variant="h6" color="text" my={0.5} fontSize="0.9rem" sx={{ 
              textShadow: 'none',
              '@media (max-width: 768px)': {
                fontSize: '0.8rem',
                my: 0.25,
              }
            }}>
              {activeStep === 0 ? "Créer votre compte pour commencer votre préparation TCF" : "Choisissez votre plan d'abonnement"}
            </MDTypography>
            
            {/* Barre d'étapes modernisée et compacte, avec sélection inversée */}
            <Box sx={{ width: '100%', mt: 0.25, mb: 0.75 }}>
              <Stepper
                activeStep={steps.length - 1 - activeStep}
                alternativeLabel
                sx={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '10px',
                  padding: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  '@media (max-width: 768px)': {
                    padding: '3px',
                    borderRadius: '8px',
                  },
                  '& .MuiStepConnector-root': {
                    '& .MuiStepConnector-line': {
                      background: 'linear-gradient(90deg, rgba(230, 240, 247, 0.9) 0%, rgba(79, 204, 231, 0.6) 100%)',
                      height: '2px !important',
                      borderRadius: '2px',
                      opacity: 1,
                      border: 'none'
                    }
                  },
                  '& .MuiStepLabel-root': {
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                  },
                  '& .MuiStepLabel-label': {
                    color: '#0083b0 !important', // Couleur foncée du thème pour une meilleure lisibilité
                    textShadow: 'none',
                    fontWeight: 700,
                  },
                  // Inverser la mise en valeur : l'étape active est atténuée, l'autre est accentuée
                  '& .MuiStepLabel-label.Mui-active': {
                    color: 'rgba(0, 0, 0, 0.75) !important', // Couleur plus foncée pour l'étape active
                    textShadow: 'none',
                  },
                  // Garder les étapes complétées accentuées (non-actives)
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel 
                      StepIconComponent={InverseStepIcon}
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: '#0083b0 !important',
                          textShadow: 'none',
                          fontWeight: 700,
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          color: 'rgba(0, 0, 0, 0.85) !important',
                          textShadow: 'none',
                        },
                      }}
                    >
                      <MDTypography sx={{
                        color: index === (steps.length - 1 - activeStep) ? 'rgba(0, 0, 0, 0.85)' : '#0083b0',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' },
                        lineHeight: 1.2
                      }}>
                        {label}
                      </MDTypography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </MDBox>
          {activeStep === 0 ? (
            <MDBox component="form" role="form" sx={{
              px: { xs: 0.5, sm: 1 },
              py: { xs: 0.25, sm: 0.5 }
            }}>
              <Grid container spacing={{ xs: 0.75, sm: 1 }}>
                <Grid item xs={12} md={6}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="text" 
                      placeholder="Nom" 
                      variant="outlined" 
                      fullWidth 
                      value={nom} 
                      onChange={(e) => setNom(e.target.value)} 
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="text" 
                      placeholder="Prénom" 
                      variant="outlined" 
                      fullWidth 
                      value={prenom} 
                      onChange={(e) => setPrenom(e.target.value)} 
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
                </Grid>
                <Grid item xs={12}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="text" 
                      placeholder="Nom d'utilisateur" 
                      variant="outlined" 
                      fullWidth 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
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
                </Grid>
                <Grid item xs={12}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="email" 
                      placeholder="Email" 
                      variant="outlined" 
                      fullWidth 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe" 
                      variant="outlined" 
                      fullWidth 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
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
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmer le mot de passe" 
                      variant="outlined" 
                      fullWidth 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowConfirmPassword}
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
                </Grid>
                <Grid item xs={5} sm={4} md={4}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <FormControl fullWidth variant="outlined" sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: '40px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
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
                        transform: 'translate(14px, 14px) scale(1)',
                        color: 'rgba(0, 0, 0, 0.6)',
                        fontSize: { xs: '0.8rem', sm: '0.85rem' },
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                      },
                    }}>
                      <Select
                        labelId="country-code-label"
                        id="country-code"
                        value={countryCode}
                        displayEmpty
                        renderValue={(value) => {
                          if (!value) return "Indicatif";
                          const selected = countryCodes.find((country) => country.code === value);
                          return (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <span style={{ fontSize: "1rem" }}>{selected?.flag}</span>
                              <span>{selected?.code}</span>
                               <span>({selected.country})</span>
                            </Box>
                          );
                        }}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {countryCodes.map((country) => (
                          <MenuItem key={country.code} value={country.code}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <span style={{ fontSize: "1rem" }}>{country.flag}</span>
                              <span>{country.code}</span>
                              <span>({country.country})</span>
                              
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={7} sm={8} md={8}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="tel" 
                      placeholder="Téléphone" 
                      variant="outlined" 
                      fullWidth 
                      value={tel} 
                      onChange={(e) => setTel(e.target.value.replace(/\D/g, ""))} 
                      inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
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
                </Grid>
              </Grid>
              <MDBox display="flex" alignItems="center" mt={{ xs: 1.5, sm: 2 }} sx={{
                 flexDirection: 'row',
                 flexWrap: 'nowrap',
                 alignItems: 'center',
                 gap: { xs: 0.5, sm: 1 },
                 ml: { xs: 0, sm: -1 },
                 width: '100%'
               }}>
                <Checkbox 
                  size="small"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  sx={{ 
                    color: 'rgba(79, 204, 231, 1)',
                    '&.Mui-checked': {
                      color: 'rgba(79, 204, 231, 1)',
                    },
                    p: { xs: 0.5, sm: 1 },
                    mr: { xs: 0.5, sm: 1 }
                  }}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  sx={{
                    color:"white", 
                    cursor: "pointer", 
                    userSelect: "none", 
                    ml: { xs: 0, sm: -1 }, 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{color:"#000000"}}>J'accepte les <a href="#" onClick={handleOpenTerms} style={{color:"#000000",fontWeight:"bold", textDecoration: "underline"}}>Conditions d'utilisation</a></span>
                </MDTypography>
              </MDBox>
              {/* Modal Conditions d'utilisation */}
              <Dialog
                open={openTerms}
                onClose={handleCloseTerms}
                fullWidth
                maxWidth="md"
                BackdropProps={{
                  sx: {
                    backgroundColor: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(4px)",
                  }
                }}
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.92)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                  }
                }}
              >
                <DialogTitle sx={{ p: 0 }}>
                  <Box sx={{
                    px: 3,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
                    color: "white"
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }} style={{color:"#fff"}}>
                      CONDITIONS GÉNÉRALES – REUSSIR TCF CANADA LTD
                    </Typography>
                    <IconButton onClick={handleCloseTerms} sx={{ color: "white" }} aria-label="Fermer">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                  <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    color: "rgba(0,0,0,0.85)",
                  }}>
                    
                    <Typography variant="body2" sx={{mt:2}}>
                      Bienvenue sur Réussir TCF Canada , un service opéré par Reussir TCF Canada LTD , société légalement enregistrée et spécialisée dans la préparation au TCF, TCF Canada, TCF Québec.
                      Notre mission : offrir un accompagnement sérieux, humain et efficace à chaque candidat souhaitant progresser et atteindre ses objectifs linguistiques.
                      En créant un compte ou en achetant un pack, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes Conditions Générales.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      1. Présentation du service
                    </Typography>
                    <Typography variant="body2">
                      Reussir TCF Canada LTD propose des programmes d’entraînement, de correction et de formation destinés à développer les compétences écrites et orales nécessaires pour réussir les tests de français (TCF).
                      L’accès aux services se fait en ligne via un espace utilisateur personnel, selon la formule choisie.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      2. Création de compte et utilisation
                    </Typography>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Le compte utilisateur est strictement personnel et ne doit en aucun cas être partagé.
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Pour le bon déroulement de votre préparation, il est important de ne pas actualiser la page pendant un test ou une activité en cours.
                      Toute actualisation ou fermeture de page durant un test sera considérée comme une utilisation complète du service concerné.
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Toute utilisation abusive ou contraire aux présentes conditions (partage de compte, triche, détournement de contenu) pourra entraîner la suspension immédiate du compte, sans remboursement.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      3. Packs et fonctionnement
                    </Typography>
                    <Typography variant="body2">
                      Les conditions suivantes s’appliquent à tous les packs proposés :
                      Bronze Plus, Silver Plus et Gold Plus.
                      Chaque pack donne accès à un nombre précis de tests, corrections ou formations selon la formule sélectionnée.
                      Une fois qu’un test ou un contenu est commencé, l’usage est automatiquement comptabilisé, même en cas de déconnexion ou d’actualisation involontaire.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      4. Conditions de paiement et politique de remboursement
                    </Typography>
                    <Typography variant="body2">
                      Les paiements s’effectuent en ligne via des systèmes sécurisés.
                      L’accès aux contenus est activé immédiatement après validation du paiement.
                      <br />
                      💰 Politique de remboursement
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Pack Bronze Plus → Non remboursables, quelle que soit la situation.
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Pack Silver Plus → Remboursement possible dans un délai de 24 heures après l’achat, uniquement si le service n’a pas été utilisé.
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Pack Gold Plus → Remboursement possible dans un délai de 24 heures après l’achat, uniquement si le service n’a pas été utilisé.
                      <br />
                      Toute demande de remboursement doit être formulée par e-mail à :
                      <br />
                      📧 info@reussir-canada.com
                      <br />
                      Passé le délai indiqué, ou dès qu’un contenu a été activé, aucun remboursement ne pourra être effectué.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      5. Protection des données personnelles
                    </Typography>
                    <Typography variant="body2">
                      Reussir TCF Canada LTD attache une grande importance à la confidentialité et à la sécurité de vos données.
                      Les informations collectées (nom, e-mail, réponses aux tests, enregistrements vocaux, etc.) sont utilisées exclusivement pour :
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> le fonctionnement du service,
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> le suivi pédagogique et la personnalisation de votre parcours,
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> l’amélioration continue de la qualité du contenu.
                      <br />
                      Aucune donnée personnelle n’est vendue ni partagée avec des tiers non autorisés.
                      Conformément aux réglementations internationales (RGPD, PIPEDA et législations locales),
                      vous pouvez à tout moment demander la modification ou la suppression de vos données via :
                      <br />
                      📧 info@reussir-canada.com
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      6. Engagements et responsabilité
                    </Typography>
                    <Typography variant="body2">
                      Reussir TCF Canada LTD s’engage à fournir un service pédagogique fiable, accessible et de qualité.
                      Cependant :
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> Les résultats, analyses et corrections sont donnés à titre indicatif et ne garantissent pas la réussite à un examen officiel.
                      <br />
                      <Box component="span" sx={{ fontWeight: 'bold' }}>·</Box> L’entreprise ne peut être tenue responsable en cas d’erreur de manipulation, de perte de données, d’actualisation de page en cours de test ou d’interruption temporaire due à la maintenance ou à la connexion Internet de l’utilisateur.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      7. Droit applicable
                    </Typography>
                    <Typography variant="body2">
                      Les présentes conditions sont régies par les lois en vigueur dans le pays de résidence de l’utilisateur.
                      En cas de litige, les parties s’efforceront de trouver une solution amiable avant toute action judiciaire.
                    </Typography>

                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#0083b0" }}>
                      ✅ Acceptation
                    </Typography>
                    <Typography variant="body2">
                      L’inscription sur la plateforme ou l’achat d’un pack vaut acceptation complète et sans réserve des présentes Conditions Générales de Reussir TCF Canada LTD.
                      En accédant au site, l’utilisateur reconnaît les avoir lues et approuvées.
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                  <Button onClick={handleCloseTerms} variant="outlined" sx={{
                    borderRadius: 2,
                    borderColor: "#0083b0",
                    color: "#0083b0",
                    textTransform: "none",
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: "rgba(79, 204, 231, 1)",
                      backgroundColor: "rgba(230, 247, 255, 0.6)",
                    }
                  }}>
                    Fermer
                  </Button>
                  <Button onClick={handleAcceptTerms} variant="contained" color="info" sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
                    boxShadow: '0 4px 12px rgba(0,123,255,.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
                      boxShadow: '0 6px 16px rgba(0,123,255,.35)'
                    }
                  }}
                  style={{color:"#fff"}}
                  >
                    J'accepte et fermer
                  </Button>
                </DialogActions>
              </Dialog>
              <MDBox mt={{ xs: 2, sm: 2.5 }} mb={1}>
                <MDButton 
                  variant="contained" 
                  color="info" 
                  fullWidth 
                  onClick={handleNext}
                  sx={{ 
                    background: 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
                    borderRadius: '30px',
                    boxShadow: '0 4px 20px 0 rgba(0,123,255,.25)',
                    height: { xs: '44px', sm: '48px' },
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))',
                      boxShadow: '0 6px 25px 0 rgba(0,123,255,.3)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all .2s ease-in-out',
                  }}
                >
                  Créer mon compte
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text" sx={{ color: '#000000', textShadow: 'none' }}>
                  Vous avez déjà un compte?{" "}
                  <MDTypography
                    component={Link}
                    to="/connexion-tcf"
                    variant="button"
                    color="primary"
                    fontWeight="medium"
                    textGradient
                    sx={{
                      color: '#00ccff',
                      textShadow: 'none',
                      '&:hover': {
                        color: '#0099cc',
                      }
                    }}
                  >
                    Se connecter
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          ) : (
            <MDBox>
     
              <SubscriptionPlans 
                email={email} 
                preSelectedPlan={new URLSearchParams(location.search).get('upgrade')}
                onSelectPlan={async (plan) => {
                  setSelectedPlan(plan);
                  console.log("Plan sélectionné:", plan);
                  
                  // Créer d'abord le compte utilisateur
                  try {
                    const userData = {
                      username,
                      email,
                      password,
                      tel: countryCode + tel,
                      nom,
                      prenom,
                      plan: plan?.id || null,
                      sold: 0, // Sera mis à jour après le paiement
                    };

                    console.log("Création du compte utilisateur:", userData);
                    const response = await authService.signup(userData);
                    console.log("Compte créé avec succès:", response.data);
                    
                    // Sauvegarder les informations de connexion
                    if (response.data.access_token) {
                      localStorage.setItem('token', response.data.access_token);
                      localStorage.setItem('user_info', JSON.stringify(response.data.user_info));
                    }
                   
                    // NOTE: La commande sera créée automatiquement par le webhook Stripe après paiement réussi
                    // Pas besoin de créer une commande manuellement ici pour éviter les doublons
                    
                    // Maintenant procéder au paiement Stripe
                     // Créer une session de paiement via le backend
                     const requestData = {
                       productId: plan.stripeProductId,
                       planName: plan.id,
                       priceInCents: plan.priceInCents,
                       email: email,
                       userId: response.data.user_info?.id,
                       successUrl: `${window.location.origin}/paiement-tcf?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
                       cancelUrl: `${window.location.origin}/inscription-tcf?cancelled=true&userId=${response.data.user_info?.id}`
                     };
                     
                     console.log('Données envoyées au backend pour Stripe:', requestData);
                     
                     const stripeResponse = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
                       method: 'POST',
                       headers: {
                         'Content-Type': 'application/json',
                         'Authorization': `Bearer ${response.data.access_token}`
                       },
                       body: JSON.stringify(requestData)
                     });
                     
                     const stripeData = await stripeResponse.json();
                     
                     if (stripeData.url) {
                       // Rediriger vers la page de paiement Stripe
                       window.location.href = stripeData.url;
                     } else {
                       throw new Error('Impossible de créer la session de paiement');
                     }
                    
                  } catch (error) {
                    console.error("Erreur lors de la création du compte:", error);
                    setError(error.response?.data?.message || "Erreur lors de la création du compte");
                    setOpenSnackbar(true);
                  }
                }}
              />
              <MDBox mt={2} display="flex" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                <MDButton 
                  variant="outlined" 
                  color="info" 
                  onClick={handleBack}
                  fullWidth
                  sx={{ 
                    borderRadius: '30px',
                    borderColor: 'rgba(79, 204, 231, 0.8)',
                    color: 'white',
                    backgroundColor: 'rgba(79, 204, 231, 0.2)',
                    backdropFilter: 'blur(10px)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    height: { xs: '44px', sm: 'auto' },
                    '&:hover': {
                      borderColor: 'rgba(79, 204, 231, 1)',
                      backgroundColor: 'rgba(79, 204, 231, 0.3)',
                    },
                  }}
                >
                  Retour
                </MDButton>
              </MDBox>
            </MDBox>
          )}
        </MDBox>
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
    </Box>
  );
}

export default Cover;
