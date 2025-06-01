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

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";

// @mui icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StarIcon from "@mui/icons-material/Star";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Overview() {
  const [userInfo, setUserInfo] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Récupérer les informations utilisateur depuis localStorage
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Erreur lors du parsing des informations utilisateur:', error);
      }
    }
  }, []);

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError("");
  };

  const handlePasswordSubmit = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("Tous les champs sont requis");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:5001/auth/signup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: userInfo.username,
          password: passwordData.newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setPasswordSuccess("Mot de passe modifié avec succès");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          setOpenPasswordDialog(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.message || "Erreur lors de la modification du mot de passe");
      }
    } catch (error) {
      setPasswordError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'pro': return 'success';
      case 'performance': return 'warning';
      case 'standard': return 'info';
      default: return 'default';
    }
  };

  const InfoCard = ({ icon, title, value, color = "info" }) => (
    <Card 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
        }
      }}
    >
      <MDBox display="flex" alignItems="center" mb={2}>
        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
          {icon}
        </Avatar>
        <MDTypography variant="h6" color="white" fontWeight="medium">
          {title}
        </MDTypography>
      </MDBox>
      <MDTypography variant="h5" color="white" fontWeight="bold">
        {value}
      </MDTypography>
    </Card>
  );

  if (!userInfo) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h4" mb={3}>
            Chargement du profil...
          </MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox p={3}>
        {/* Header avec avatar et informations principales */}
        <Card 
          sx={{ 
            p: 4, 
            mb: 4, 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2.5rem'
                }}
              >
                {userInfo.prenom?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <MDTypography variant="h3" color="white" fontWeight="bold" mb={1}>
                {userInfo.prenom} {userInfo.nom}
              </MDTypography>
              <MDTypography variant="h6" color="white" opacity={0.8} mb={2}>
                @{userInfo.username}
              </MDTypography>
              <MDBox display="flex" gap={2} flexWrap="wrap">
                <Chip 
                  label={userInfo.subscription_plan?.toUpperCase() || 'STANDARD'} 
                  color={getPlanColor(userInfo.subscription_plan)}
                  icon={<StarIcon />}
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
                <Chip 
                  label={`${userInfo.sold || 0} crédits`}
                  color="success"
                  icon={<AccountBalanceWalletIcon />}
                  sx={{ color: 'white', fontWeight: 'bold' }}
                />
              </MDBox>
            </Grid>
            <Grid item>
              <MDButton 
                variant="contained" 
                color="white" 
                startIcon={<EditIcon />}
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ 
                  color: '#f5576c',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.9)' 
                  }
                }}
              >
                Changer le mot de passe
              </MDButton>
            </Grid>
          </Grid>
        </Card>

        {/* Grille d'informations */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<PersonIcon />}
              title="Nom complet"
              value={`${userInfo.prenom || ''} ${userInfo.nom || ''}`.trim() || 'Non spécifié'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<EmailIcon />}
              title="Email"
              value={userInfo.email || 'Non spécifié'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<PhoneIcon />}
              title="Téléphone"
              value={userInfo.tel || 'Non spécifié'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<CalendarTodayIcon />}
              title="Date de naissance"
              value={formatDate(userInfo.date_naissance)}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<AccountBalanceWalletIcon />}
              title="Crédits disponibles"
              value={`${userInfo.sold || 0} crédits`}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <InfoCard 
              icon={<StarIcon />}
              title="Total des crédits"
              value={`${userInfo.total_sold || 0} crédits`}
            />
          </Grid>
        </Grid>

        {/* Informations supplémentaires */}
        <Card sx={{ p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <MDTypography variant="h5" fontWeight="bold" mb={3} color="dark">
            Informations du compte
          </MDTypography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MDBox mb={2}>
                <MDTypography variant="body2" color="text" fontWeight="medium">
                  Nom d'utilisateur
                </MDTypography>
                <MDTypography variant="body1" color="dark">
                  {userInfo.username}
                </MDTypography>
              </MDBox>

            </Grid>
            <Grid item xs={12} md={6}>
              <MDBox mb={2}>
                <MDTypography variant="body2" color="text" fontWeight="medium">
                  Statut de paiement
                </MDTypography>
                <Chip 
                  label={userInfo.payment_status === 'paid' ? 'Payé' : 'En attente'}
                  color={userInfo.payment_status === 'paid' ? 'success' : 'warning'}
                  size="small"
                />
              </MDBox>

            </Grid>
          </Grid>
        </Card>

        {/* Dialog pour changer le mot de passe */}
        <Dialog 
          open={openPasswordDialog} 
          onClose={() => setOpenPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <MDBox display="flex" alignItems="center">
              <LockIcon sx={{ mr: 1, color: 'info.main' }} />
              <MDTypography variant="h5" fontWeight="bold">
                Changer le mot de passe
              </MDTypography>
            </MDBox>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}
            <TextField
              fullWidth
              type="password"
              label="Mot de passe actuel"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              type="password"
              label="Nouveau mot de passe"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              margin="normal"
              variant="outlined"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirmer le nouveau mot de passe"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              margin="normal"
              variant="outlined"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <MDButton 
              onClick={() => setOpenPasswordDialog(false)} 
              color="secondary"
              variant="outlined"
            >
              Annuler
            </MDButton>
            <MDButton 
              onClick={handlePasswordSubmit} 
              color="info"
              variant="gradient"
              disabled={loading}
            >
              {loading ? 'Modification...' : 'Modifier'}
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
