/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

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
        maxWidth: activeStep === 1 ? 1000 : 700,
        width: "100%",
        mx: "auto",
        overflow: "visible",
        transition: "max-width 0.3s ease-in-out",
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
          {/* <MDTypography variant="h4" fontWeight="bold" color="white">
            Réussir TCF Canada
          </MDTypography> */}
          <MDTypography display="block" variant="button" color="white" my={1} fontSize="1rem">
            {activeStep === 0 ? "Créez votre compte pour commencer votre préparation" : "Choisissez votre plan d'abonnement"}
          </MDTypography>
          <Box sx={{ width: '100%', mt: 1 }}>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{
                background: 'linear-gradient(135deg, #0083b0, rgba(12, 140, 169, 0.77)) !important',
                borderRadius: '8px',
                padding: '16px',
                '& .MuiStepConnector-root': {
                  '& .MuiStepConnector-line': {
                    background: 'white !important',
                    height: '3px !important',
                    borderRadius: '2px',
                    opacity: 1,
                    border: 'none'
                  }
                },
                '& .MuiStepLabel-root': {
                  color: 'white !important',
                  fontWeight: 'bold',
                },
                '& .MuiStepIcon-root': {
                  color: 'white',
                  boxShadow: '0 2px 4px rgba(255, 255, 255, 0.5)',
                  borderRadius: '50%'
                },
                '& .MuiStepIcon-text': {
                  fill: '#0083b0',
                  fontWeight: 'bold'
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
        <MDBox pt={2} pb={2} px={3}>
          {activeStep === 0 ? (
            <MDBox component="form" role="form">
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={4}>
                  <MDBox mb={1}>
                    <FormControl fullWidth variant="outlined" sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        height: '45px',
                        '&:hover fieldset': {
                          borderColor: '#0062E6',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, 18px) scale(1)',
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
                  <MDBox mb={1}>
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
                          '&:hover fieldset': {
                            borderColor: '#0062E6',
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Grid>
              </Grid>
              <MDBox display="flex" alignItems="center" ml={-1} mt={2}>
                <Checkbox 
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  sx={{ 
                    color: '#0062E6',
                    '&.Mui-checked': {
                      color: '#0062E6',
                    },
                  }}
                />
                <MDTypography
                  variant="button"
                  fontWeight="regular"
                  color="text"
                  sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
                >
                  &nbsp;&nbsp;J'accepte les&nbsp;
                </MDTypography>
                <MDTypography
                  component="a"
                  href="#"
                  variant="button"
                  fontWeight="bold"
                  color="info"
                  textGradient
                >
                  Conditions d'utilisation
                </MDTypography>
              </MDBox>
              <MDBox mt={4} mb={1}>
                <MDButton 
                  variant="contained" 
                  color="info" 
                  fullWidth 
                  onClick={handleNext}
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
                  Continuer
                </MDButton>
              </MDBox>
              <MDBox mt={3} mb={1} textAlign="center">
                <MDTypography variant="button" color="text">
                  Vous avez déjà un compte?{" "}
                  <MDTypography
                    component={Link}
                    to="/authentication/sign-in"
                    variant="button"
                    color="info"
                    fontWeight="medium"
                    textGradient
                  >
                    Connectez-vous
                  </MDTypography>
                </MDTypography>
              </MDBox>
            </MDBox>
          ) : (
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium" textAlign="center" mb={3}>
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
                    borderColor: '#0062E6',
                    color: '#0062E6',
                    '&:hover': {
                      borderColor: '#0062E6',
                      backgroundColor: 'rgba(0, 98, 230, 0.08)',
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
