/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

// @mui icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import SubscriptionsIcon from "@mui/icons-material/Subscriptions";
import Visibility from "@mui/icons-material/Visibility";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// React hooks
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../../services/config';

// Services
import authService from "services/authService";
import subscriptionPackService from "services/subscriptionPackService";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default country code
  const [balanceType, setBalanceType] = useState("sold"); // Type de solde à modifier: "sold" ou "total_sold"
  const [newBalanceValue, setNewBalanceValue] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nom: "",
    prenom: "",
    tel: "",
    subscription_plan: "",
    role: "",
    sold: ""
  });

  const countryCodes = [
    { code: "+1", label: "Canada/USA (+1)" },
    { code: "+33", label: "France (+33)" },
    { code: "+32", label: "Belgium (+32)" },
    { code: "+49", label: "Germany (+49)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+34", label: "Spain (+34)" },
    { code: "+39", label: "Italy (+39)" },
    { code: "+41", label: "Switzerland (+41)" },
    { code: "+212", label: "Morocco (+212)" },
    { code: "+213", label: "Algeria (+213)" },
  ];

  // Les plans d'abonnement sont maintenant récupérés dynamiquement

  const userRoles = [
    { value: "client", label: "Client" },
    { value: "admin", label: "Administrateur" },
    { value: "moderator", label: "Modérateur" }
  ];

  // Fetch users and subscription plans on component mount
  useEffect(() => {
    fetchUsers();
    fetchSubscriptionPlans();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const packs = await subscriptionPackService.getActivePacks();
      const formattedPlans = packs.map(pack => ({
        value: pack.pack_id,
        label: pack.name,
        color: getColorFromPackId(pack.pack_id)
      }));
      // Ajouter l'option "Aucun plan"
      formattedPlans.push({ value: null, label: "Aucun plan", color: "secondary" });
      setSubscriptionPlans(formattedPlans);
    } catch (error) {
      console.error('Erreur lors du chargement des plans d\'abonnement:', error);
      // Fallback vers les plans par défaut en cas d'erreur
      setSubscriptionPlans([
        { value: "standard", label: "Pack Écrit Standard", color: "info" },
        { value: "performance", label: "Pack Écrit Performance", color: "warning" },
        { value: "pro", label: "Pack Écrit Pro", color: "success" },
        { value: null, label: "Aucun plan", color: "secondary" }
      ]);
    }
  };

  const getColorFromPackId = (packId) => {
    const colorMap = {
      'standard': 'info',
      'performance': 'warning',
      'pro': 'success'
    };
    return colorMap[packId] || 'primary';
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
        nom: user.nom || "",
        prenom: user.prenom || "",
        tel: user.tel || "",
        subscription_plan: user.subscription_plan || "",
        role: user.role || "client"
      });
      setConfirmPassword("");
      setCountryCode(user.tel ? user.tel.substring(0, user.tel.indexOf(user.tel.match(/\d/))) : "+1");
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        username: "",
        email: "",
        password: "",
        nom: "",
        prenom: "",
        tel: "",
        subscription_plan: "",
        role: "client"
      });
      setConfirmPassword("");
      setCountryCode("+1");
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setSelectedUser(null);
  };

  const handleOpenBalanceDialog = (user) => {
    setSelectedUser(user);
    setNewBalanceValue(balanceType === "sold" ? user.sold || "0" : user.total_sold || "0");
    setOpenBalanceDialog(true);
  };

  const handleCloseBalanceDialog = () => {
    setOpenBalanceDialog(false);
    setSelectedUser(null);
    setNewBalanceValue("");
  };

  const handleBalanceTypeChange = (type) => {
    setBalanceType(type);
    if (selectedUser) {
      setNewBalanceValue(type === "sold" ? selectedUser.sold || "0" : selectedUser.total_sold || "0");
    }
  };

  const handleUpdateBalance = async () => {
    try {
      const endpoint = balanceType === "sold" ? "/auth/update-sold" : "/auth/update-total-sold";
      const paramName = balanceType === "sold" ? "new_sold_value" : "new_total_sold_value";
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: selectedUser.username,
          [paramName]: parseFloat(newBalanceValue)
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        showSnackbar(`Solde ${balanceType === "sold" ? "" : "total "} mis à jour avec succès`);
        fetchUsers();
        handleCloseBalanceDialog();
      } else {
        throw new Error('Erreur lors de la mise à jour du solde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showSnackbar('Erreur lors de la mise à jour du solde', 'error');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!editMode && formData.password !== confirmPassword) {
      showSnackbar("Les mots de passe ne correspondent pas", "error");
      return;
    }

    const telWithCode = formData.tel ? `${countryCode} ${formData.tel}` : "";

    try {
      if (editMode) {
        // Update user
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            tel: telWithCode,
            plan: formData.subscription_plan
          }),
        });
        
        if (response.ok) {
          showSnackbar('Utilisateur modifié avec succès');
          fetchUsers();
          handleCloseDialog();
        } else {
          throw new Error('Erreur lors de la modification');
        }
      } else {
        // Create new user
        const response = await authService.signup({
          ...formData,
          tel: telWithCode,
          plan: formData.subscription_plan
        });
        
        showSnackbar('Utilisateur créé avec succès');
        fetchUsers();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Erreur:', error);
      showSnackbar(editMode ? 'Erreur lors de la modification' : 'Erreur lors de la création', 'error');
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/delete/${username}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          showSnackbar('Utilisateur supprimé avec succès');
          fetchUsers();
        } else {
          throw new Error('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const getPlanChip = (plan) => {
    const planInfo = subscriptionPlans.find(p => p.value === plan) || 
                     subscriptionPlans.find(p => p.value === null) || 
                     { label: "Aucun plan", color: "secondary" };
    return (
      <Chip
        label={planInfo.label}
        color={planInfo.color}
        size="small"
        variant="outlined"
      />
    );
  };

  // Table columns and rows
  const columns = [
    { Header: "Utilisateur", accessor: "user", width: "20%", align: "left" },
    { Header: "Contact", accessor: "contact", width: "18%", align: "left" },
    { Header: "Solde", accessor: "info", width: "15%", align: "center" },
    { Header: "Plan", accessor: "plan", width: "12%", align: "center" },
    { Header: "Rôle", accessor: "role", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "15%", align: "center" },
  ];

  const rows = users.map((user) => ({
    user: (
      <MDBox display="flex" alignItems="center" lineHeight={1}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2
          }}
        >
          <PersonIcon sx={{ color: "white", fontSize: 20 }} />
        </Box>
        <MDBox lineHeight={1}>
          <MDTypography display="block" variant="button" fontWeight="medium">
            {user.prenom} {user.nom}
          </MDTypography>
          <MDTypography variant="caption" color="text">
            @{user.username}
          </MDTypography>
        </MDBox>
      </MDBox>
    ),
    contact: (
      <MDBox lineHeight={1}>
        <MDBox display="flex" alignItems="center" mb={0.5}>
          <EmailIcon sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
          <MDTypography variant="caption" color="text">
            {user.email}
          </MDTypography>
        </MDBox>
        <MDBox display="flex" alignItems="center">
          <PhoneIcon sx={{ fontSize: 16, mr: 1, color: "text.secondary" }} />
          <MDTypography variant="caption" color="text">
            {user.tel || "Non renseigné"}
          </MDTypography>
        </MDBox>
      </MDBox>
    ),
    info: (
      <MDBox textAlign="center" lineHeight={1}>
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {user.sold || "0.00"} / {user.total_sold || "0.00"}
        </MDTypography>
      </MDBox>
    ),
    plan: getPlanChip(user.subscription_plan),
    role: (
      <Chip
        label={userRoles.find(r => r.value === user.role)?.label || "Client"}
        color={user.role === "admin" ? "error" : user.role === "moderator" ? "warning" : "primary"}
        size="small"
        variant="outlined"
      />
    ),
    actions: (
      <MDBox display="flex" justifyContent="center" gap={1}>
        <Tooltip title="Modifier">
          <IconButton
          style={{color: "white"}}
            size="small"
            color="info"
            onClick={() => handleOpenDialog(user)}
            sx={{
              background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))",
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Modifier le solde">
          <IconButton
            style={{color: "white"}}
            size="small"
            color="success"
            onClick={() => handleOpenBalanceDialog(user)}
            sx={{
              background: "linear-gradient(135deg, #2ECC71, #27AE60)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #27AE60, #229954)",
              }
            }}
          >
            <AccountBalanceWalletIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            style={{color: "white"}}
            size="small"
            color="error"
            onClick={() => handleDeleteUser(user.username)}
            sx={{
              background: "linear-gradient(135deg, #FF512F, #DD2476)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #DF412F, #BD1456)",
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </MDBox>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
              }}
              >
                <MDBox>
                  <MDTypography variant="h6" color="white">
                    Gestion des Utilisateurs
                  </MDTypography>
                  <MDTypography variant="body2" color="white" opacity={0.8}>
                    Gérez les comptes utilisateurs et leurs abonnements
                  </MDTypography>
                </MDBox>
                <MDButton
                  variant="contained"
                  color="white"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    color: "#0062E6",
                    fontWeight: "bold",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                    }
                  }}
                >
                  Nouvel Utilisateur
                </MDButton>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                  canSearch
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog for Add/Edit User */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
            color: "white",
            textAlign: "center",
            py: 3
          }}
        >
          <MDTypography variant="h5" color="white" fontWeight="bold">
            {editMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          </MDTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 4,mt:3 }}
       
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Nom d'utilisateur"
                fullWidth
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                disabled={editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            {!editMode && (
              <Grid item xs={12}>
                <MDInput
                  label="Mot de passe"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <MDInput
                label="Nom"
                fullWidth
                value={formData.nom}
                onChange={(e) => handleInputChange("nom", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Prénom"
                fullWidth
                value={formData.prenom}
                onChange={(e) => handleInputChange("prenom", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            {!editMode && (
              <>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label="Confirmer le mot de passe"
                    type={showConfirmPassword ? "text" : "password"}
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 2, minHeight: '45px' }}>
                <InputLabel>Indicatif Pays</InputLabel>
                <Select
                  style={{ minHeight: '44px' }}
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  label="Indicatif Pays"
                >
                  {countryCodes.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Téléphone"
                fullWidth
                value={formData.tel}
                onChange={(e) => handleInputChange("tel", e.target.value)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" sx={{ minHeight: '45px' }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                 style={{minHeight: '44px' }}
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  label="Rôle"
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2, minHeight: '45px' }}>
                <InputLabel>Plan d'abonnement</InputLabel>
                <Select
                  style={{minHeight: '44px' }}
                  value={formData.subscription_plan || ""}
                  label="Plan d'abonnement"
                  onChange={(e) => handleInputChange("subscription_plan", e.target.value)}
                >
                  {subscriptionPlans.map((plan) => (
                    <MenuItem key={plan.value} value={plan.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SubscriptionsIcon fontSize="small" />
                        {plan.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            style={{color:'#000' }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold"
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            style={{color:'#fff' }}
            sx={{
              background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))",
              }
            }}
          >
            {editMode ? "Modifier" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Balance Modification */}
      <Dialog
        open={openBalanceDialog}
        onClose={handleCloseBalanceDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 40px -12px rgba(0,0,0,0.3)",
          }
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #2ECC71, #27AE60)",
            color: "white",
            textAlign: "center",
            py: 3
          }}
        >
          <MDTypography variant="h5" color="white" fontWeight="bold">
            Modifier le solde
          </MDTypography>
          {selectedUser && (
            <MDTypography variant="subtitle2" color="white" opacity={0.8}>
              Utilisateur: {selectedUser.prenom} {selectedUser.nom} (@{selectedUser.username})
            </MDTypography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 4, mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <MDTypography variant="subtitle2" fontWeight="medium" mb={2}>
                  Type de solde à modifier:
                </MDTypography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Button
                      variant={balanceType === "sold" ? "contained" : "outlined"}
                      onClick={() => handleBalanceTypeChange("sold")}
                      sx={{
                        background: balanceType === "sold" ? "linear-gradient(135deg, #2ECC71, #27AE60)" : "transparent",
                        color: balanceType === "sold" ? "white" : "#2ECC71",
                        borderColor: "#2ECC71",
                        "&:hover": {
                          background: balanceType === "sold" ? "linear-gradient(135deg, #27AE60, #229954)" : "rgba(46, 204, 113, 0.1)",
                        }
                      }}
                    >
                      Solde actuel
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant={balanceType === "total_sold" ? "contained" : "outlined"}
                      onClick={() => handleBalanceTypeChange("total_sold")}
                      sx={{
                        background: balanceType === "total_sold" ? "linear-gradient(135deg, #2ECC71, #27AE60)" : "transparent",
                        color: balanceType === "total_sold" ? "white" : "#2ECC71",
                        borderColor: "#2ECC71",
                        "&:hover": {
                          background: balanceType === "total_sold" ? "linear-gradient(135deg, #27AE60, #229954)" : "rgba(46, 204, 113, 0.1)",
                        }
                      }}
                    >
                      Solde total
                    </Button>
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label={balanceType === "sold" ? "Nouveau solde" : "Nouveau solde total"}
                type="number"
                fullWidth
                value={newBalanceValue}
                onChange={(e) => setNewBalanceValue(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <MDBox display="flex" alignItems="center" mr={1}>
                      <AccountBalanceWalletIcon color="success" />
                    </MDBox>
                  ),
                }}
              />
              <MDTypography variant="caption" color="text" mt={1} display="block">
                {balanceType === "sold" ? 
                  "Le solde actuel représente les crédits disponibles pour l'utilisateur." : 
                  "Le solde total représente tous les crédits achetés par l'utilisateur."}
              </MDTypography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
          <Button
            onClick={handleCloseBalanceDialog}
            variant="outlined"
            style={{color:'#000' }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold"
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleUpdateBalance}
            variant="contained"
            style={{color:'#fff' }}
            sx={{
              background: "linear-gradient(135deg, #2ECC71, #27AE60)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(135deg, #27AE60, #229954)",
              }
            }}
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
}

export default UserManagement;