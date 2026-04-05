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
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toggleShowCurrent = () => setShowCurrentPassword(v => !v);
  const toggleShowNew = () => setShowNewPassword(v => !v);
  const toggleShowConfirm = () => setShowConfirmPassword(v => !v);

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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
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

  const InfoCard = ({ icon, title, value, color = "#1976d2", showButton = false, onButtonClick }) => (
    <Card 
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        cursor: showButton ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${color}20`,
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        }
      }}
      onClick={onButtonClick}
    >
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={1}>
              <Avatar 
                sx={{ 
                  bgcolor: `${color}25`,
                  color: color,
                  mr: 2,
                  width: 56,
                  height: 56,
                  fontSize: '1.5rem'
                }}
              >
                {icon}
              </Avatar>
            </MDBox>
            <MDTypography variant="h3" fontWeight="bold" color="dark" mb={0.5}>
              {value}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="medium">
              {title}
            </MDTypography>
            {showButton && (
              <MDBox mt={2}>
                <MDButton 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    '&:hover': { 
                      background: `linear-gradient(135deg, ${color}dd 0%, ${color}bb 100%)`,
                      transform: 'translateY(-2px)',
                    }
                  }}
                  style={{ color: 'white' }}
              >
                  Utiliser mes crédits
                </MDButton>
              </MDBox>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );

  const TotalCreditsCard = () => {
    const color = '#ff9800'; // Orange color for credits
    return (
      <Card 
        sx={{
          borderRadius: 4,
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: `0 20px 40px ${color}20`,
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          }
        }}
      >
        <MDBox p={3}>
          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
            <MDBox>
              <MDBox display="flex" alignItems="center" mb={1}>
                <Avatar 
                 sx={{ 
                   bgcolor: `${color}25`,
                   color: color,
                   mr: 2,
                   width: 56,
                   height: 56,
                   fontSize: '1.5rem'
                 }}
               >
                 <StarIcon />
               </Avatar>
              </MDBox>
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={0.5}>
                {userInfo?.total_sold || 0}
              </MDTypography>
              <MDTypography variant="button" color="text" fontWeight="medium">
                Total des crédits
              </MDTypography>
              <MDBox display="flex" alignItems="center" mt={1}>
                <WorkspacePremiumIcon sx={{ mr: 1, fontSize: '1.2rem', color: color }} />
                <MDTypography variant="caption" color="text" sx={{ opacity: 0.8 }}>
                  Plan: {userInfo?.subscription_plan?.toUpperCase() || 'STANDARD'}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    );
  };

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
            borderRadius: 4,
            background: 'linear-gradient(135deg, #1976d215 0%, #1976d205 100%)',
            border: '1px solid #1976d220',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px #1976d220',
              background: 'linear-gradient(135deg, #1976d220 0%, #1976d210 100%)',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%231976d2" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              opacity: 0.3
            }
          }}
        >
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  width: { xs: 80, md: 120 }, 
                  height: { xs: 80, md: 120 }, 
                  bgcolor: 'rgba(79, 204, 231, 0.2)',
                  fontSize: { xs: '2rem', md: '3rem' },
                  border: '3px solid rgba(79, 204, 231, 1)',
                  color:'#344767',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                }}
              
              >
                {userInfo.prenom?.[0]?.toUpperCase() || userInfo.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </Grid>
            <Grid item xs>
              <MDTypography variant="h3" color="dark" fontWeight="bold" mb={1}>
                {userInfo.prenom} {userInfo.nom}
              </MDTypography>
              <MDTypography variant={{ xs: 'body1', md: 'h6' }} color="text" opacity={0.8} mb={2}>
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
                <MDTypography variant="body2" color="text" fontWeight="medium">
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
                  color: '#0083b0',
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
              color="#4caf50"
            />
          </Grid>

          <Grid item xs={12} md={6} lg={6}>
            <InfoCard 
              icon={<EmailIcon />}
              title="Email"
              value={userInfo.email || 'Non spécifié'}
              color="#2196f3"
            />
          </Grid>
          
          <Grid item xs={12} md={6} lg={6}>
            <InfoCard 
              icon={<AccountBalanceWalletIcon />}
              title="Crédits disponibles"
              value={`${userInfo.sold || 0} crédits`}
              color="#9c27b0"
              showButton={true}
              onButtonClick={() => setOpenCreditsDialog(true)}
            />
          </Grid>        
        </Grid>

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
              type={showCurrentPassword ? "text" : "password"}
              label="Mot de passe actuel"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showCurrentPassword ? "Masquer le mot de passe actuel" : "Afficher le mot de passe actuel"}
                      onClick={toggleShowCurrent}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              type={showNewPassword ? "text" : "password"}
              label="Nouveau mot de passe"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showNewPassword ? "Masquer le nouveau mot de passe" : "Afficher le nouveau mot de passe"}
                      onClick={toggleShowNew}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              label="Confirmer le nouveau mot de passe"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirmPassword ? "Masquer le mot de passe de confirmation" : "Afficher le mot de passe de confirmation"}
                      onClick={toggleShowConfirm}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
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
                    navigate('/simulateur-tcf-expression-ecrite');
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
                    navigate('/simulateur-tcf-expression-orale');
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
