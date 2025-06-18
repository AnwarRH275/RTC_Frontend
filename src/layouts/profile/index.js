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
import { useNavigate } from "react-router-dom";

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
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

// API configuration
import { API_BASE_URL } from '../../services/config';

// @mui icons
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StarIcon from "@mui/icons-material/Star";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import CreateIcon from "@mui/icons-material/Create";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function Overview() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openCreditsDialog, setOpenCreditsDialog] = useState(false);
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
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
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

  const InfoCard = ({ icon, title, value, color = "info", showButton = false, onButtonClick }) => (
    <Card 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
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
      {showButton && (
        <MDBox mt={2}>
          <MDButton 
            variant="contained" 
            color="white" 
            size="small"
            onClick={onButtonClick}
            sx={{ 
              color: '#0083b0',
              fontWeight: 'bold',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.9)' 
              }
            }}
          >
            Utiliser mes crédits
          </MDButton>
        </MDBox>
      )}
    </Card>
  );

  const TotalCreditsCard = () => (
    <Card 
      sx={{ 
        p: 3, 
        height: '100%',
        background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, #0083b0 100%)',
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
          <StarIcon />
        </Avatar>
        <MDTypography variant="h6" color="white" fontWeight="medium">
          Total des crédits
        </MDTypography>
      </MDBox>
      
      <MDBox display="flex" alignItems="center" mb={2}>
        <WorkspacePremiumIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
        <MDTypography variant="body1" color="white" fontWeight="medium">
          Plan: {userInfo.subscription_plan?.toUpperCase() || 'STANDARD'}
        </MDTypography>
      </MDBox>
      
      <MDBox display="flex" alignItems="center">
        <AccountBalanceWalletIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
        <MDTypography variant="h5" color="white" fontWeight="bold">
          {userInfo.total_sold || 0} crédits
        </MDTypography>
      </MDBox>
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
      <MDBox p={{ xs: 2, md: 3 }}>
        {/* Header avec avatar et informations principales */}
        <Card 
          sx={{ 
            p: { xs: 3, md: 4 }, 
            mb: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
              opacity: 0.5
            }
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: { xs: 80, md: 120 }, 
                  height: { xs: 80, md: 120 }, 
                  bgcolor: 'rgba(255,255,255,0.25)',
                  fontSize: { xs: '2rem', md: '3rem' },
                  border: '3px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              >
                {userInfo.prenom?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <MDTypography variant="h3" color="white" fontWeight="bold" mb={1}>
                {userInfo.prenom} {userInfo.nom}
              </MDTypography>
              <MDTypography variant={{ xs: 'body1', md: 'h6' }} color="white" opacity={0.9} mb={2}>
                @{userInfo.username}
              </MDTypography>
              <Grid item xs>
              <MDBox 
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  px: 2,
                  py: 0.5
                }}
              >
                <MDTypography variant="body2" color="white" fontWeight="medium">
                  Membre depuis {formatDate(userInfo.date_create)}
                </MDTypography>
              </MDBox>
              </Grid>
            </Grid>
            <Grid item>
              <MDButton 
                variant="contained" 
                color="white" 
                startIcon={<EditIcon />}
                onClick={() => setOpenPasswordDialog(true)}
                sx={{ 
                  color: '#667eea',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  boxShadow: '0 8px 25px rgba(255,255,255,0.3)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 35px rgba(255,255,255,0.4)'
                  }
                }}
              >
                Modifier mon mot de passe
              </MDButton>
            </Grid>
          </Grid>
        </Card>

        {/* Grille d'informations */}
        <Grid container spacing={2} mb={4}>

        <Grid item xs={12} md={6} lg={6}>
            <TotalCreditsCard />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <InfoCard 
              icon={<CalendarTodayIcon />}
              title="Date de création"
              value={formatDate(userInfo.date_create)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <InfoCard 
              icon={<EmailIcon />}
              title="Email"
              value={userInfo.email || 'Non spécifié'}
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={6}>
            <InfoCard 
              icon={<AccountBalanceWalletIcon />}
              title="Crédits disponibles"
              value={`${userInfo.sold || 0} crédits`}
              showButton={true}
              onButtonClick={() => setOpenCreditsDialog(true)}
            />
          </Grid>
        
        </Grid>

        {/* Informations supplémentaires */}
    

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
                Modifier mon mot de passe
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

        {/* Dialog pour utiliser les crédits */}
        <Dialog 
          open={openCreditsDialog} 
          onClose={() => setOpenCreditsDialog(false)}
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
              <PlayArrowIcon sx={{ mr: 1, color: 'info.main' }} />
              <MDTypography variant="h5" fontWeight="bold">
                Utiliser mes crédits
              </MDTypography>
            </MDBox>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <MDTypography variant="body1" color="text" mb={3}>
              Choisissez le type de simulateur que vous souhaitez utiliser :
            </MDTypography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    p: 3, 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%)',
                    '&:hover': {
                      borderColor: 'info.main',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    navigate('/simulateur-tcf-canada/expression-ecrits/results/:subjectId');
                    setOpenCreditsDialog(false);
                  }}
                >
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <CreateIcon />
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold" color="dark">
                        Simulateur Expression Écrite
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Pratiquez vos compétences en expression écrite
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card 
                  sx={{ 
                    p: 3, 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)',
                    '&:hover': {
                      borderColor: 'success.main',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={() => {
                    navigate('/tcf-simulator/oral');
                    setOpenCreditsDialog(false);
                  }}
                >
                  <MDBox display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <RecordVoiceOverIcon />
                    </Avatar>
                    <MDBox>
                      <MDTypography variant="h6" fontWeight="bold" color="dark">
                        Simulateur Expression Orale
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Pratiquez vos compétences en expression orale
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <MDButton 
              onClick={() => setOpenCreditsDialog(false)} 
              color="secondary"
              variant="outlined"
            >
              Annuler
            </MDButton>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
