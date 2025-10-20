import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Box, Typography, Alert } from '@mui/material';
import MDBox from '../../components/MDBox';
import MDTypography from '../../components/MDTypography';
import DashboardLayout from '../../examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from '../../examples/Navbars/DashboardNavbar';
import Footer from '../../examples/Footer';
import SubscriptionPlans from '../authentication/sign-up/SubscriptionPlans';
import { API_BASE_URL } from '../../services/config';

function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const storedUserInfo = localStorage.getItem('user_info');
    
    if (!token) {
      // Rediriger vers la page de connexion si pas connecté
      navigate('/connexion-tcf');
      return;
    }
    
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Erreur lors du parsing des infos utilisateur:', error);
        setError('Erreur lors de la récupération des informations utilisateur');
      }
    }
    
    setLoading(false);
  }, [navigate]);

  const handlePlanSelect = async (plan) => {
    if (!userInfo) {
      setError('Informations utilisateur non disponibles');
      return;
    }

    try {
      // Créer une session de paiement Stripe pour l'utilisateur connecté
      const requestData = {
        productId: plan.stripeProductId,
        planName: plan.id,
        priceInCents: plan.priceInCents,
        email: userInfo.email,
        userId: userInfo.id,
        successUrl: `${window.location.origin}/paiement-tcf?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
            cancelUrl: `${window.location.origin}/packs-tcf-canada`
      };
      
      // Ajouter le code de coupon si le plan en a un
      if (plan.hasCoupon && plan.couponCode) {
        requestData.couponCode = plan.couponCode;
        console.log(`Coupon appliqué: ${plan.couponCode}`);
      }
      
      const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (data.url) {
        // Rediriger vers la page de paiement Stripe
        window.location.href = data.url;
      } else {
        setError('Erreur lors de la création de la session de paiement');
      }
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      setError('Une erreur est survenue lors de la création de la session de paiement');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Container maxWidth="lg">
            <MDBox textAlign="center">
              <MDTypography variant="h4" fontWeight="medium">
                Chargement...
              </MDTypography>
            </MDBox>
          </Container>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Container maxWidth="lg">
          <MDBox mb={4} textAlign="center">
            <MDTypography variant="h3" fontWeight="medium" gutterBottom>
              Choisissez votre plan d'abonnement
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3}>
              Améliorez votre expérience avec nos plans premium
            </MDTypography>
            {userInfo && (
              <MDTypography variant="body2" color="info">
                Plan actuel: {userInfo.subscription_plan || 'Aucun'} | 
                Solde: {userInfo.sold || 0} crédits
              </MDTypography>
            )}
          </MDBox>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Card sx={{ p: 3, borderRadius: 2 }}>
            <SubscriptionPlans 
              email={userInfo?.email}
              onSelectPlan={handlePlanSelect}
            />
          </Card>
        </Container>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default SubscriptionPlansPage;