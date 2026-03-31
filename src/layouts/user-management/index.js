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
import CircularProgress from '@mui/material/CircularProgress';
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
import { useInfoUser } from "context";

// Services
import authService from "services/authService";
import subscriptionPackService from "services/subscriptionPackService";

function UserManagement() {
  const { userInfo } = useInfoUser(); // Récupérer les infos de l'utilisateur connecté
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // utilisé pour l'état de chargement du tableau

  const [openDialog, setOpenDialog] = useState(false);
  const [openBalanceDialog, setOpenBalanceDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default country code
  const [deletingUser, setDeletingUser] = useState(null); // username currently being deleted (to disable button)
  const [balanceType, setBalanceType] = useState("sold"); // Type de solde à modifier: "sold" ou "total_sold"
  const [newBalanceValue, setNewBalanceValue] = useState("");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401) {
        showSnackbar('Session expirée. Veuillez vous reconnecter.', 'error');
        // Optionnel : rediriger ou déconnecter
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();

      // Si l'utilisateur est modérateur, filtrer pour ne montrer que les utilisateurs qu'il peut gérer
      if (userInfo?.role === 'moderator') {
        const filteredUsers = data.filter(user => 
          (user.role === 'client' && user.created_by === userInfo.username) ||
          user.username === userInfo.username
        );
        setUsers(filteredUsers);
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      showSnackbar(error.message || 'Erreur lors du chargement des utilisateurs', 'error');
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

  // Fetch users and subscription plans on component mount
  useEffect(() => {
    fetchUsers();
    fetchSubscriptionPlans();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Vérifier les permissions pour les modérateurs
      if (userInfo?.role === 'moderator') {
        if (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) {
          showSnackbar('Vous n\'avez pas l\'autorisation de modifier cet utilisateur', 'error');
          return;
        }
        if (user.created_by !== userInfo.username && user.role !== 'client' && user.username !== userInfo.username) {
          showSnackbar('Vous ne pouvez modifier que les utilisateurs que vous avez créés', 'error');
          return;
        }
      }
      
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
    // Vérifier les permissions pour les modérateurs
    if (userInfo?.role === 'moderator') {
      if (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) {
        showSnackbar('Vous n\'avez pas l\'autorisation de modifier le solde de cet utilisateur', 'error');
        return;
      }
      if (user.created_by !== userInfo.username && user.role !== 'client' && user.username !== userInfo.username) {
        showSnackbar('Vous ne pouvez modifier que le solde des utilisateurs que vous avez créés', 'error');
        return;
      }
    }
    
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
        await response.json();
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
    const adminEditingPassword = editMode && userInfo?.role === "admin" && (formData.password || confirmPassword);

    if ((!editMode || adminEditingPassword) && formData.password !== confirmPassword) {
      showSnackbar("Les mots de passe ne correspondent pas", "error");
      return;
    }

    if ((!editMode || adminEditingPassword) && formData.password && formData.password.length < 6) {
      showSnackbar("Le mot de passe doit contenir au moins 6 caractères", "error");
      return;
    }

    const telWithCode = formData.tel ? `${countryCode} ${formData.tel}` : "";
    const payload = {
      ...formData,
      tel: telWithCode,
      plan: formData.subscription_plan
    };

    try {
      if (editMode) {
        if (userInfo?.role !== "admin" || !formData.password) {
          delete payload.password;
        }

        // Update user
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
    
          },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
          showSnackbar('Utilisateur modifié avec succès');
          fetchUsers();
          handleCloseDialog();
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erreur lors de la modification');
        }
      } else {
        // Create new user
        await authService.signup(payload);
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
    const userToDelete = users.find(u => u.username === username);

    // Seuls les administrateurs peuvent supprimer des utilisateurs
    if (userInfo?.role !== 'admin') {
      showSnackbar('Seuls les administrateurs peuvent supprimer des utilisateurs', 'error');
      return;
    }

    // Prévenir si l'utilisateur n'existe pas dans l'UI
    if (!userToDelete) {
      showSnackbar('Utilisateur introuvable dans la liste', 'error');
      return;
    }

    const confirmMsg = username === userInfo.username ?
      'Vous êtes sur le point de supprimer votre propre compte. Continuer et vous serez déconnecté(e). Continuer ?' :
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?';

    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingUser(username);
      const encodedUsername = encodeURIComponent(username);
      const response = await fetch(`${API_BASE_URL}/auth/delete/${encodedUsername}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Gérer statuts HTTP spécifiques
      if (response.status === 401) {
        setDeletingUser(null);
        showSnackbar('Session expirée. Veuillez vous reconnecter.', 'error');
        return;
      }

      if (response.status === 403) {
        const err = await response.json().catch(() => ({}));
        setDeletingUser(null);
        showSnackbar(err.message || 'Vous n\'avez pas la permission de supprimer cet utilisateur', 'error');
        return;
      }

      if (response.status === 404) {
        setDeletingUser(null);
        showSnackbar('Utilisateur non trouvé', 'error');
        fetchUsers();
        return;
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setDeletingUser(null);
        throw new Error(err.message || 'Erreur lors de la suppression');
      }

      // Succès
      showSnackbar('Utilisateur supprimé avec succès');

      // Supprimer localement pour réactivité immédiate
      setUsers(prev => prev.filter(u => u.username !== username));

      // Si on a supprimé soi-même, déconnecter
      if (username === userInfo.username) {
        authService.logout();
        window.location.href = '/login';
        return;
      }

      setDeletingUser(null);
    } catch (error) {
      console.error('Erreur:', error);
      setDeletingUser(null);
      showSnackbar(error.message || 'Erreur lors de la suppression', 'error');
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
    { Header: "Solde", accessor: "info", width: "12%", align: "center" },
    { Header: "Plan", accessor: "plan", width: "10%", align: "center" },
    { Header: "Rôle", accessor: "role", width: "8%", align: "center" },
    { Header: "Création", accessor: "datecreation", width: "10%", align: "center" },
    { Header: "Actions", accessor: "actions", width: "12%", align: "center" },
  ];

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (user.username || "").toLowerCase().includes(q) ||
      (user.email || "").toLowerCase().includes(q) ||
      (user.nom || "").toLowerCase().includes(q) ||
      (user.prenom || "").toLowerCase().includes(q) ||
      (user.tel || "").toLowerCase().includes(q) ||
      (user.role || "").toLowerCase().includes(q) ||
      (user.date_create ? new Date(user.date_create).toLocaleDateString("fr-FR") : "").includes(q)
    );
  });

  const rows = filteredUsers.map((user) => ({
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
    datecreation: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {(user.datecreation || user.date_create)
          ? new Date(user.datecreation || user.date_create).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
          : "—"}
      </MDTypography>
    ),
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
        <Tooltip title={userInfo?.role === 'moderator' && (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) ? "Non autorisé" : "Modifier"}>
          <span>
            <IconButton
            style={{color: "white"}}
              size="small"
              color="info"
              onClick={() => handleOpenDialog(user)}
              disabled={userInfo?.role === 'moderator' && (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) && user.created_by !== userInfo.username}
              sx={{
                background: "linear-gradient(135deg, rgba(79, 204, 231, 1), #0083b0)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #0083b0, rgba(79, 204, 231, 1))",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)"
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={userInfo?.role === 'moderator' && (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) ? "Non autorisé" : "Modifier le solde"}>
          <span>
            <IconButton
              style={{color: "white"}}
              size="small"
              color="success"
              onClick={() => handleOpenBalanceDialog(user)}
              disabled={userInfo?.role === 'moderator' && (user.role === 'admin' || (user.role === 'moderator' && user.username !== userInfo.username)) && user.created_by !== userInfo.username}
              sx={{
                background: "linear-gradient(135deg, #2ECC71, #27AE60)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(135deg, #27AE60, #229954)",
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)"
                }
              }}
            >
              <AccountBalanceWalletIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={userInfo?.role !== 'admin' ? "Seuls les administrateurs peuvent supprimer" : "Supprimer"}>
          <span>
            <IconButton
              style={{color: "white"}}
              size="small"
              color="error"
              onClick={() => handleDeleteUser(user.username)}
              disabled={userInfo?.role !== 'admin' || deletingUser === user.username}
              sx={{
                backgroundColor: "#d32f2f", // red 700
                color: "white",
                "&:hover": {
                  backgroundColor: "#b71c1c", // darker red
                },
                "&:disabled": {
                  background: "rgba(0, 0, 0, 0.12)",
                  color: "rgba(0, 0, 0, 0.26)"
                }
              }}
            >
              {deletingUser === user.username ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteIcon fontSize="small" />
              )}
            </IconButton>
          </span>
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
                  disabled={loading}
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
              <MDBox px={3} pt={3} display="flex" justifyContent="flex-end">
                <MDInput
                  placeholder="Rechercher..."
                  value={searchQuery}
                  size="small"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: "12rem" }}
                />
              </MDBox>
              <MDBox pt={1}>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" py={5}>
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
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
                InputLabelProps={{ shrink: !!formData.username }}
                inputProps={{ style: { textOverflow: 'ellipsis', overflow: 'hidden' } }}
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
                InputLabelProps={{ shrink: !!formData.email }}
                inputProps={{ style: { textOverflow: 'ellipsis', overflow: 'hidden' } }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Nom"
                fullWidth
                value={formData.nom}
                onChange={(e) => handleInputChange("nom", e.target.value)}
                InputLabelProps={{ shrink: !!formData.nom }}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Prénom"
                fullWidth
                value={formData.prenom}
                onChange={(e) => handleInputChange("prenom", e.target.value)}
                InputLabelProps={{ shrink: !!formData.prenom }}
                sx={{ mb: 2 }}
              />
            </Grid>
            {(!editMode || (editMode && userInfo?.role === 'admin')) && (
              <>
                <Grid item xs={12} md={6}>
                  <MDInput
                    label={editMode ? "Nouveau mot de passe" : "Mot de passe"}
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
                    label={editMode ? "Confirmer le nouveau mot de passe" : "Confirmer le mot de passe"}
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
                {editMode && userInfo?.role === 'admin' && (
                  <Grid item xs={12}>
                    <MDTypography variant="caption" color="text">
                      Laissez les champs mot de passe vides pour conserver le mot de passe actuel.
                    </MDTypography>
                  </Grid>
                )}
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
                InputLabelProps={{ shrink: !!formData.tel }}
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
                  disabled={userInfo?.role === 'moderator' && (selectedUser?.role === 'admin' || selectedUser?.role === 'moderator')}
                >
                  {userRoles
                    .filter(role => {
                      // Les modérateurs ne peuvent pas assigner le rôle admin ou moderator
                      if (userInfo?.role === 'moderator') {
                        return role.value === 'client';
                      }
                      return true;
                    })
                    .map((role) => (
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
           
            sx={{
              background: "linear-gradient(135deg, #2ECC71, #27AE60)",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(135deg, #27AE60, #229954)",
              }
            }}
             style={{color:'#fff !important' }}
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