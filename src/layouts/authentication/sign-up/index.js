// react-router-dom components
import { Link, useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import { Stepper, Step, StepLabel, Box, FormControl, InputLabel, Select, MenuItem, Snackbar, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

import { useState, useEffect } from "react";
import authService from "services/authService";
import SubscriptionPlans from "./SubscriptionPlans";
import { API_BASE_URL } from '../../../services/config';

// Images
import logoTcfCanada from "assets/logo-tfc-canada.png";
// import bgImage from "assets/images/tcf-canada-background.svg";
const bgImage = "https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"; //  URL de l'image de fond

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

  // Vérifier si l'utilisateur vient du bouton "upgrade to pro"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const upgradeParam = params.get('upgrade');
    
    if (upgradeParam === 'pro') {
      // Passer directement à l'étape de sélection de plan
      setActiveStep(1);
      // Pré-sélectionner le plan Pro (sera fait dans SubscriptionPlans)
    }
  }, [location.search]);

  const steps = ['Informations personnelles', 'Choisir un plan'];

  const countryCodes = [
    { code: "+1", country: "Canada/USA" },
    { code: "+33", country: "France" },
    { code: "+32", country: "Belgique" },
    { code: "+41", country: "Suisse" },
    { code: "+212", country: "Maroc" },
    { code: "+213", country: "Algérie" },
    { code: "+216", country: "Tunisie" },
    { code: "+225", country: "Côte d'Ivoire" },
    { code: "+221", country: "Sénégal" },
    { code: "+237", country: "Cameroun" },
  ];

  const handleNext = () => {
    if (activeStep === 0) {
      // Validation des champs du formulaire
      if (!username || !email || !password || !confirmPassword || !tel || !nom || !prenom) {
        setError("Veuillez remplir tous les champs");
        setOpenSnackbar(true);
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setOpenSnackbar(true);
        return;
      }
      if (!agreeTerms) {
        setError("Veuillez accepter les conditions d'utilisation");
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

  return (
    <CoverLayout image={bgImage}>
        <Card sx={{
        maxWidth: activeStep === 1 ? 900 : 600,
        width: "95%",
        mx: "auto",
        transition: "all 0.3s ease-in-out",
        borderRadius: 3,
        boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        WebkitBackdropFilter: "blur(20px)", // Support Safari
        '@media (max-width: 768px)': {
          width: "95%",
          maxWidth: "95%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        },
        '@media (max-width: 480px)': {
          width: "98%",
          maxWidth: "98%",
          borderRadius: 2,
        }
      }}>
        <MDBox pt={1} pb={1} px={2} sx={{
          '@media (max-width: 768px)': {
            px: 1.5,
            pt: 0.5,
            pb: 0.5,
          }
        }}>
          {/* Logo TCF Canada mis en évidence */}
          <MDBox display="flex" justifyContent="center" mb={1.5} sx={{
            position: 'relative',
            '@media (max-width: 768px)': {
              mb: 1,
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(79, 204, 231, 0.3) 0%, rgba(79, 204, 231, 0.1) 50%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 0,
            }
          }}>
            <img 
              src={logoTcfCanada} 
              alt="TCF Canada Logo" 
              style={{ 
                height: '110px', 
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
              <MDTypography variant="h5" fontWeight="bold" color="white" sx={{ 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
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
            <MDTypography display="block" variant="h6" color="white" my={0.5} fontSize="0.9rem" sx={{ 
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              '@media (max-width: 768px)': {
                fontSize: '0.8rem',
                my: 0.25,
              }
            }}>
              {activeStep === 0 ? "Créer votre compte pour commencer votre préparation TCF" : "Choisissez votre plan d'abonnement"}
            </MDTypography>
            
            {/* Stepper optimisé */}
            <Box sx={{ width: '100%', mt: 0.5, mb: 1 }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '6px',
                  padding: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  '@media (max-width: 768px)': {
                    padding: '4px',
                    borderRadius: '4px',
                  },
                  '& .MuiStepConnector-root': {
                    '& .MuiStepConnector-line': {
                      background: 'rgba(255, 255, 255, 0.8) !important',
                      height: '3px !important',
                      borderRadius: '2px',
                      opacity: 1,
                      border: 'none'
                    }
                  },
                  '& .MuiStepLabel-root': {
                    color: 'white !important',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  },
                  '& .MuiStepIcon-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                    backgroundColor: 'rgba(79, 204, 231, 0.8)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    borderRadius: '50%',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  },
                  '& .MuiStepIcon-text': {
                    fill: 'white',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
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
                      label="Nom" 
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
                      label="Prénom" 
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
                      label="Nom d'utilisateur" 
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
                      label="Email" 
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
                      label="Mot de passe" 
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
                      label="Confirmer le mot de passe" 
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
                <Grid item xs={12} md={4}>
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
                      <InputLabel id="country-code-label">Indicatif</InputLabel>
                      <Select
                        labelId="country-code-label"
                        id="country-code"
                        value={countryCode}
                        label="Indicatif"
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {countryCodes.map((country) => (
                          <MenuItem key={country.code} value={country.code}>
                            {country.code} ({country.country})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={8}>
                  <MDBox mb={{ xs: 0.75, sm: 1 }}>
                    <MDInput 
                      type="tel" 
                      label="Téléphone" 
                      variant="outlined" 
                      fullWidth 
                      value={tel} 
                      onChange={(e) => setTel(e.target.value)} 
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
              <MDBox display="flex" alignItems="center" ml={-1} mt={{ xs: 1.5, sm: 2 }} sx={{
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  ml: 0,
                }
              }}>
                <Checkbox 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  sx={{ 
                    color: 'rgba(79, 204, 231, 1)',
                    '&.Mui-checked': {
                      color: 'rgba(79, 204, 231, 1)',
                    },
                    '@media (max-width: 768px)': {
                      padding: '4px',
                    }
                  }}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  sx={{
                    color:"white", 
                    cursor: "pointer", 
                    userSelect: "none", 
                    ml: -1, 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    '@media (max-width: 768px)': {
                      fontSize: '0.8rem',
                      ml: 0,
                      mt: 0.5,
                    }
                  }}
                >
                  &nbsp;&nbsp;<span style={{color:"white"}}>J'accepte les&nbsp;  <a  href="#" style={{color:"white",fontWeight:"bold"}}>Conditions d'utilisation</a></span>
                </MDTypography>
              </MDBox>
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
              <MDBox mt={{ xs: 1.5, sm: 2 }} mb={1} textAlign="center">
                <MDTypography variant="button" color="white" sx={{ 
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  '@media (max-width: 768px)': {
                    fontSize: '0.8rem',
                  }
                }}>
                 <span> Vous avez déjà un compte?{" "} <Link to="/authentication/sign-in"
                 style={{color:"white",fontWeight:"bold"}}
                 >Connectez-vous</Link>  </span>
            
                </MDTypography>
              </MDBox>
            </MDBox>
          ) : (
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium" textAlign="center" mb={3} color="white" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Choisissez votre plan pour commencer votre préparation au TCF Canada
              </MDTypography>
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
                       successUrl: `${window.location.origin}/authentication/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
                       cancelUrl: `${window.location.origin}/authentication/sign-up`
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
              <MDBox mt={2} display="flex" justifyContent="space-between">
                <MDButton 
                  variant="outlined" 
                  color="info" 
                  onClick={handleBack}
                  sx={{ 
                    borderRadius: '30px',
                    borderColor: 'rgba(79, 204, 231, 0.8)',
                    color: 'white',
                    backgroundColor: 'rgba(79, 204, 231, 0.2)',
                    backdropFilter: 'blur(10px)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
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
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </CoverLayout>
  );
}

export default Cover;
