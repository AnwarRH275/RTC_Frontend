import React, { useState } from 'react';
import { Card, Box, Typography, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";

// Clé publique Stripe
const stripePromise = loadStripe('pk_test_51RPoNkGbR6tCbwFHGpmyQJHVvFNdqbZABAA5hJPvCnQsPR9C8dDXkiojPusno6ow5CngADJHkRdVnrtOwHeFTCNe00VVxsQVJ1');

// Styled components pour un design moderne
const PlanCard = styled(Card)(({ theme, isPopular }) => ({
  borderRadius: 16,
  boxShadow: isPopular 
    ? '0 10px 20px rgba(0, 123, 255, 0.3)' 
    : '0 6px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease', // Add border to transition
  overflow: 'hidden',
  height: 'auto', // Change height to auto
  display: 'flex',
  flexDirection: 'column',
  position: 'relative', // Add position relative
  border: isPopular ? `2px solid ${theme.palette.primary.main}` : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isPopular 
      ? '0 15px 30px rgba(0, 123, 255, 0.4)' 
      : '0 12px 24px rgba(0, 0, 0, 0.15)',
    zIndex: 1, // Add z-index to bring the hovered card to the front
    border: isPopular ? `2px solid ${theme.palette.primary.dark}` : `2px solid ${theme.palette.grey[300]}`, // Add explicit border on hover
  },
}));

const PlanHeader = styled(Box)(({ theme, color }) => ({
  background: color === 'standard' 
    ? 'linear-gradient(135deg, #0062E6, #33AEFF)' 
    : color === 'performance' 
      ? 'linear-gradient(135deg, #FF512F, #DD2476)' 
      : 'linear-gradient(135deg, #11998e, #38ef7d)',
  padding: theme.spacing(0.5), // Further reduced padding
  color: 'white', // Ensure text color is white
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

const ActionButton = styled(Button)(({ theme, color }) => ({
  borderRadius: 20,
  padding: '10px 16px',
  fontWeight: 700,
  textTransform: 'none',
  fontSize: '1rem',
  marginTop: 'auto',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
  background: color === 'standard' 
    ? 'linear-gradient(135deg, #0062E6, #33AEFF)' 
    : color === 'performance' 
      ? 'linear-gradient(135deg, #FF512F, #DD2476)' 
      : 'linear-gradient(135deg, #11998e, #38ef7d)',
  color: 'white', // Ensure text color is white
  '&:hover': {
    background: color === 'standard' 
      ? 'linear-gradient(135deg, #0062E6, #0062E6)' 
      : color === 'performance' 
        ? 'linear-gradient(135deg, #DD2476, #DD2476)' 
        : 'linear-gradient(135deg, #11998e, #11998e)',
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

const SubscriptionPlans = ({ email }) => {
  const [loading, setLoading] = useState(false);
  
  // Configuration des plans avec les produits Stripe
  const plans = [
    {
      id: 'standard',
      name: 'Pack Écrit Standard',
      price: '14',
      priceInCents: 1499, // Prix en centimes pour Stripe
      usages: 5,
      color: 'standard',
      isPopular: false,
      stripeProductId: 'prod_SMeQcS5gdyO7Nh',
      features: [
        `5 examens réels basés sur les sujets d'actualité 2025`,
        'Remarques personnalisées sur chaque production',
        'Modèles corrigés pour chaque tâche',
        `Accès complet au simulateur d'expression écrite`,
        'Simulation en conditions réelles',
        'Note estimée selon le CECR',
      ],
    },
    {
      id: 'performance',
      name: 'Pack Écrit Performance',
      price: '29',
      priceInCents: 2999, // Prix en centimes pour Stripe
      usages: 15,
      color: 'performance',
      isPopular: true,
      stripeProductId: 'prod_SMePWWnxhhQXZJ',
      features: [
        `15 examens réels basés sur les sujets d'actualité 2025`,
        'Remarques personnalisées sur chaque production',
        'Modèles corrigés pour chaque tâche',
        `Accès complet au simulateur d'expression écrite`,
        'Simulation en conditions réelles',
        'Note estimée selon le CECR',
      ],
    },
    {
      id: 'pro',
      name: 'Pack Écrit Pro',
      price: '49',
      priceInCents: 4999, // Prix en centimes pour Stripe
      usages: 30,
      color: 'pro',
      isPopular: false,
      stripeProductId: 'prod_SMeQ8tIJeu8sHA',
      features: [
        `30 examens réels basés sur les sujets d'actualité 2025`,
        'Remarques personnalisées sur chaque production',
        'Modèles corrigés pour chaque tâche',
        `Accès complet au simulateur d'expression écrite`,
        'Simulation en conditions réelles',
        'Note estimée selon le CECR',
      ],
    },
  ];

  // Fonction pour créer une session de paiement Stripe via le backend
  const handleCheckout = async (plan) => {
    setLoading(true);
    try {
      // Créer une session de paiement via le backend
      const requestData = {
        productId: plan.stripeProductId,
        planName: plan.id,
        priceInCents: plan.priceInCents,
        email: email,
        // userId: userData.id, // L'ID utilisateur sera géré par le backend après l'inscription
        successUrl: `${window.location.origin}/authentication/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
        cancelUrl: `${window.location.origin}/authentication/sign-up`
      };
      
      console.log('Données envoyées au backend:', requestData);
      
      const response = await axios.post('http://localhost:5001/stripe/create-checkout-session', requestData);

      // Récupérer l'URL de la session Stripe
      const { url } = response.data;
      
      // Rediriger vers la page de paiement Stripe
      window.location.href = url;
      
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

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
            <PlanHeader color={plan.color}>
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
              <ActionButton 
                variant="contained" 
                fullWidth 
                color="primary" 
                disableElevation
                onClick={() => handleCheckout(plan)}
                disabled={loading}
                sx={{ 
                  color: 'white',
                  fontSize: '1.1rem',
                  py: 1.5,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}
              >
                {loading ? 'Chargement...' : 'Acheter maintenant'}
              </ActionButton>
            </PlanContent>
          </PlanCard>
        </Box>
      ))}
    </Box>
  );
};

export default SubscriptionPlans;