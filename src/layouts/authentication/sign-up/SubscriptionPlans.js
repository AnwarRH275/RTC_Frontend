import React, { useState, useEffect } from 'react';
import { Card, Box, Typography, Button, Chip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import subscriptionPackService from '../../../services/subscriptionPackService';
import MDButton from 'components/MDButton';
import { API_BASE_URL } from '../../../services/config';

// Clé publique Stripe
const stripePromise = loadStripe('pk_test_51RPoNkGbR6tCbwFHGpmyQJHVvFNdqbZABAA5hJPvCnQsPR9C8dDXkiojPusno6ow5CngADJHkRdVnrtOwHeFTCNe00VVxsQVJ1');

// Styled components pour un design moderne
const PlanCard = styled(Card)(({ theme, isPopular }) => ({
  borderRadius: 16,
  boxShadow: isPopular 
    ? '0 10px 20px rgba(0, 123, 255, 0.3)' 
    : '0 6px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
  overflow: 'hidden',
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  border: isPopular ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isPopular 
      ? '0 15px 30px rgba(0, 123, 255, 0.4)' 
      : '0 12px 24px rgba(0, 0, 0, 0.15)',
    zIndex: 1,
    border: isPopular ? `2px solid ${theme.palette.primary.dark}` : `2px solid ${theme.palette.grey[300]}`,
  },
}));

const PlanHeader = styled(Box)(({ theme, headerGradient }) => ({
  background: headerGradient 
    ? `linear-gradient(135deg, ${headerGradient.start}, ${headerGradient.end})`
    : 'linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)',
  padding: theme.spacing(0.5),
  color: 'white',
  textAlign: 'center',
}));

const PlanPrice = styled(Box)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'baseline',
  marginBottom: theme.spacing(1),
}));

const PlanContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(0.75),
  fontSize: '0.85rem',
}));

const ActionButton = styled(Button)(({ theme, buttonGradient, buttonHoverGradient }) => ({
  borderRadius: 20,
  padding: '10px 16px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  marginTop: 'auto',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
  background: buttonGradient 
    ? `linear-gradient(135deg, ${buttonGradient.start}, ${buttonGradient.end})`
    : 'linear-gradient(135deg, #11998e, #38ef7d)',
  color: 'white',
  '&:hover': {
    background: buttonHoverGradient 
      ? `linear-gradient(135deg, ${buttonHoverGradient.start}, ${buttonHoverGradient.end})`
      : 'linear-gradient(135deg, #0083b0, #0083b0)',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
}));

const PopularBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 30, // Adjusted top position
  right: 10,
  backgroundColor: theme.palette.error.main,
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  color: 'white',
  fontWeight: 'bold',
  zIndex: 1,
}));

const SubscriptionPlans = ({ email, onSelectPlan, preSelectedPlan = null }) => {
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlanForDisplay, setSelectedPlanForDisplay] = useState(preSelectedPlan);

  // Charger les packs depuis l'API
  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoadingPlans(true);
        setError(null);
        
        // Récupérer les packs actifs depuis l'API
        const packsData = await subscriptionPackService.getActivePacks();
        
        // Transformer les données pour correspondre au format attendu
         const transformedPlans = packsData.map(pack => ({
           id: pack.pack_id,
           name: pack.name,
           price: pack.price,
           priceInCents: pack.priceInCents,
           usages: pack.usages,
           color: pack.color,
           isPopular: pack.isPopular,
           stripeProductId: pack.stripeProductId,
           headerGradient: pack.headerGradient || { start: '#0062E6', end: '#33AEFF' },
           buttonGradient: pack.buttonGradient || { start: '#11998e', end: '#38ef7d' },
           buttonHoverGradient: pack.buttonHoverGradient || { start: '#0083b0', end: '#0083b0' },
           buttonText: pack.buttonText || 'Payer maintenant',
           features: pack.features ? pack.features.map(f => f.featureText || f) : []
         }));
        
        setPlans(transformedPlans);
        
        // Si un plan est pré-sélectionné (ex: 'pro'), le trouver et l'afficher
        if (preSelectedPlan) {
          const preSelected = transformedPlans.find(plan => plan.id === preSelectedPlan);
          if (preSelected) {
            setSelectedPlanForDisplay(preSelected);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des packs:', error);
        setError('Impossible de charger les plans d\'abonnement. Veuillez réessayer.');
        
       
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, []);

  // Fonction pour sélectionner un plan directement (sans passer par Stripe)
  const handleSelectPlan = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan);
    }
  };

  // Fonction pour créer une session de paiement Stripe via le backend
  const handleCheckout = async (plan) => {
    setLoadingPlanId(plan.id);
    try {
      // Récupérer les informations utilisateur si disponibles
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user_info');
      let userId = null;
      
      if (token && userInfo) {
        try {
          const parsedUserInfo = JSON.parse(userInfo);
          userId = parsedUserInfo.id;
        } catch (e) {
          console.warn('Impossible de parser les informations utilisateur:', e);
        }
      }
      
      // Créer une session de paiement via le backend
      const requestData = {
        productId: plan.stripeProductId,
        planName: plan.id,
        priceInCents: plan.priceInCents,
        email: email,
        userId: userId, // Inclure l'ID utilisateur si disponible
        successUrl: `${window.location.origin}/authentication/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
        cancelUrl: `${window.location.origin}/authentication/sign-up`
      };
      
      // Ajouter le code de coupon si le plan en a un
      if (plan.hasCoupon && plan.couponCode) {
        requestData.couponCode = plan.couponCode;
        console.log(`Coupon appliqué: ${plan.couponCode}`);
      }
      
      console.log('Données envoyées au backend:', requestData);
      
      const response = await axios.post(`${API_BASE_URL}/stripe/create-checkout-session`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      // Récupérer l'URL de la session Stripe
      const { url } = response.data;
      
      // Rediriger vers la page de paiement Stripe
      window.location.href = url;
      
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  // Affichage du chargement
  if (loadingPlans) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '300px',
        width: '100%'
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Chargement des plans d'abonnement...
        </Typography>
      </Box>
    );
  }

  // Affichage d'erreur
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '300px',
        width: '100%',
        textAlign: 'center'
      }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  // Si un plan spécifique est sélectionné pour affichage (ex: upgrade to pro), afficher seulement ce plan
  if (selectedPlanForDisplay) {
    const planToDisplay = plans.find(plan => plan.id === selectedPlanForDisplay.id || plan.id === selectedPlanForDisplay);
    
    if (planToDisplay) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3, 
          width: '100%',
          maxWidth: '500px',
          mx: 'auto',
          my: 2,
          px: 1
        }}>
          <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 2 }}>
            Mise à niveau vers {planToDisplay.name}
          </Typography>
          
          <Box sx={{ width: '100%' }}>
            <PlanCard isPopular={planToDisplay.isPopular}>
              {planToDisplay.isPopular && <PopularBadge label="POPULAIRE" />}
              <PlanHeader headerGradient={planToDisplay.headerGradient}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ zIndex: planToDisplay.isPopular ? 2 : 'auto', position: 'relative' }}>
                  {planToDisplay.name}
                </Typography>
                <PlanPrice>
                  <Typography component="span" sx={{ fontSize: '1.2rem', alignSelf: 'flex-start', mt: 1 }}>
                    $
                  </Typography>
                  {planToDisplay.price}
                  <Typography component="span" sx={{ fontSize: '1.2rem', ml: 0.5 }}>
                    .99
                  </Typography>
                </PlanPrice>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {planToDisplay.usages} Usages
                </Typography>
              </PlanHeader>
              <PlanContent>
                {planToDisplay.features.map((feature, index) => (
                  <FeatureItem key={index}>
                    <CheckIcon sx={{ color: '#4CAF50', mr: 1, fontSize: '1.2rem' }} />
                    <Typography variant="body2">{feature}</Typography>
                  </FeatureItem>
                ))}
                <Box sx={{ flexGrow: 1, minHeight: 15 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <ActionButton 
                    variant="contained" 
                    fullWidth 
                    color="primary" 
                    disableElevation
                    buttonGradient={planToDisplay.buttonGradient}
                    buttonHoverGradient={planToDisplay.buttonHoverGradient}
                    onClick={() => {
                      // Si l'utilisateur est connecté (token présent), aller directement au paiement
                      const token = localStorage.getItem('token');
                      if (token) {
                        handleCheckout(planToDisplay);
                      } else if (onSelectPlan) {
                        // Sinon, utiliser onSelectPlan pour créer le compte d'abord
                        onSelectPlan(planToDisplay);
                      } else {
                        // Fallback vers handleCheckout
                        handleCheckout(planToDisplay);
                      }
                    }}
                    disabled={loadingPlanId === planToDisplay.id}
                    sx={{ 
                      fontSize: '1.1rem',
                      py: 1.5,
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {loadingPlanId === planToDisplay.id ? 'Chargement...' : planToDisplay.buttonText}
                  </ActionButton>
                  
                  <MDButton 
                    variant="outlined" 
                    fullWidth
                    onClick={() => setSelectedPlanForDisplay(null)}
                    sx={{ 
                      mt: 1,
                      borderColor: '#ccc',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#999',
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    Voir tous les plans
                  </MDButton>
                </Box>
              </PlanContent>
            </PlanCard>
          </Box>
        </Box>
      );
    }
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 2, 
      width: '100%',
      maxWidth: '1200px',
      height: 'auto',
      maxHeight: '65vh',
      overflow: 'auto',
      my: 2,
      px: 1,
      mx: 'auto'
    }}>
      {plans.map((plan) => (
        <Box key={plan.id} sx={{ flex: 1, minWidth: { xs: '100%', md: '220px' } }}>
          <PlanCard isPopular={plan.isPopular}>
            {plan.isPopular && <PopularBadge label="POPULAIRE" />}
            <PlanHeader headerGradient={plan.headerGradient}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ zIndex: plan.isPopular ? 2 : 'auto', position: 'relative' }}>
                {plan.name}
              </Typography>
              <PlanPrice>
                <Typography component="span" sx={{ fontSize: '1.2rem', alignSelf: 'flex-start', mt: 1 }}>
                  $
                </Typography>
                {plan.price}
                <Typography component="span" sx={{ fontSize: '1.2rem', ml: 0.5 }}>
                  .99
                </Typography>
              </PlanPrice>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {plan.usages} Usages
              </Typography>
            </PlanHeader>
            <PlanContent>
              {plan.features.map((feature, index) => (
                <FeatureItem key={index}>
                  <CheckIcon sx={{ color: '#4CAF50', mr: 1, fontSize: '1.2rem' }} />
                  <Typography variant="body2">{feature}</Typography>
                </FeatureItem>
              ))}
              <Box sx={{ flexGrow: 1, minHeight: 15 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              
                <ActionButton 
                  variant="contained" 
                  fullWidth 
                  color="primary" 
                  disableElevation
                  buttonGradient={plan.buttonGradient}
                  buttonHoverGradient={plan.buttonHoverGradient}
                  onClick={() => {
                    // Si l'utilisateur est connecté (token présent), aller directement au paiement
                    const token = localStorage.getItem('token');
                    if (token) {
                      handleCheckout(plan);
                    } else if (onSelectPlan) {
                      // Sinon, utiliser onSelectPlan pour créer le compte d'abord
                      onSelectPlan(plan);
                    } else {
                      // Fallback vers handleCheckout
                      handleCheckout(plan);
                    }
                  }}
                  disabled={loadingPlanId === plan.id}
                  sx={{ 
                    fontSize: '1.1rem',
                    py: 1.5,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {loadingPlanId === plan.id ? 'Chargement...' : plan.buttonText}
                </ActionButton>
              </Box>
            </PlanContent>
          </PlanCard>
        </Box>
      ))}
    </Box>
  );
};

export default SubscriptionPlans;