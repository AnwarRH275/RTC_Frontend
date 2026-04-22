import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  IconButton,
  Alert,
  Snackbar,
  Fab,
  Tooltip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ColorLens as ColorLensIcon,
  AttachMoney as AttachMoneyIcon,
  FormatListBulleted as FeaturesIcon,
  Remove as RemoveIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Components
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

// Services
import subscriptionPackService from 'services/subscriptionPackService';
import syncService from 'services/syncService';

// Styled components
const PackCard = styled(Card)(({ theme, isActive, isPopular }) => ({
  borderRadius: '28px 28px 16px 16px',
  overflow: 'hidden',
  boxShadow: isActive 
    ? '0 8px 16px rgba(0, 0, 0, 0.15)' 
    : '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  border: isPopular ? `2px solid ${theme.palette.warning.main}` : 'none',
  opacity: isActive ? 1 : 0.7,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
  },
}));

const GradientHeader = styled(Box)(({ gradientStart, gradientEnd }) => ({
  background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
  padding: '16px',
  color: 'white',
  textAlign: 'center',
  borderRadius: '28px 28px 0 0',
}));

const ColorPreview = styled(Box)(({ color }) => ({
  width: 24,
  height: 24,
  borderRadius: '50%',
  backgroundColor: color,
  border: '2px solid #fff',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  display: 'inline-block',
  marginRight: 8,
}));

function PackManagement() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, packId: null });
  const [syncingUsages, setSyncingUsages] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    pack_id: '',
    name: '',
    price: '',
    priceInCents: '',
    usages: '',
    color: 'standard',
    isPopular: false,
    stripeProductId: '',
    headerGradient: { start: '#0062E6', end: '#33AEFF' },
    buttonGradient: { start: '#0062E6', end: '#33AEFF' },
    buttonHoverGradient: { start: '#0062E6', end: '#0062E6' },
    isActive: true,
    features: ['']
  });

  // Load packs on component mount
  useEffect(() => {
    loadPacks();
  }, []);

  // Load all packs
  const loadPacks = async () => {
    try {
      setLoading(true);
      // console.log('Loading packs...');
      const data = await subscriptionPackService.getAllPacks();
      // console.log('Loaded packs data:', data);
      
      // Vérifier que les données sont valides
      if (Array.isArray(data)) {
        setPacks(data);
        // console.log('Packs set successfully:', data.length, 'packs');
      } else {
        console.error('Invalid packs data format:', data);
        showSnackbar('Format de données invalide reçu du serveur', 'error');
        setPacks([]);
      }
    } catch (error) {
      console.error('Error loading packs:', error);
      showSnackbar(`Erreur lors du chargement des packs: ${error.message}`, 'error');
      setPacks([]);
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate price in cents when price changes
    if (field === 'price') {
      const priceInCents = Math.round(parseFloat(value || 0) * 100);
      setFormData(prev => ({
        ...prev,
        priceInCents: priceInCents
      }));
    }

    // Update gradients when color changes
    if (field === 'color') {
      const defaultGradients = subscriptionPackService.getDefaultGradients(value);
      setFormData(prev => ({
        ...prev,
        headerGradient: defaultGradients.header,
        buttonGradient: defaultGradients.button,
        buttonHoverGradient: defaultGradients.buttonHover
      }));
    }
  };

  // Handle gradient changes
  const handleGradientChange = (gradientType, colorType, value) => {
    setFormData(prev => ({
      ...prev,
      [gradientType]: {
        ...prev[gradientType],
        [colorType]: value
      }
    }));
  };

  // Handle feature changes
  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Add new feature
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // Remove feature
  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, features: newFeatures }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      pack_id: '',
      name: '',
      price: '',
      priceInCents: '',
      usages: '',
      color: 'standard',
      isPopular: false,
      stripeProductId: '',
      headerGradient: { start: '#0062E6', end: '#33AEFF' },
      buttonGradient: { start: '#0062E6', end: '#33AEFF' },
      buttonHoverGradient: { start: '#0062E6', end: '#0062E6' },
      buttonText: 'Payer maintenant',
      isActive: true,
      features: ['']
    });
    setEditingPack(null);
  };

  // Open dialog for creating new pack
  const handleCreatePack = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Open dialog for editing pack
  const handleEditPack = (pack) => {
    // console.log('Editing pack:', pack);
    
    // Traitement sécurisé des features
    let processedFeatures = [''];
    if (pack.features && Array.isArray(pack.features)) {
      processedFeatures = pack.features.map(f => {
        if (typeof f === 'object' && f.featureText) {
          return f.featureText;
        } else if (typeof f === 'string') {
          return f;
        } else {
          console.warn('Invalid feature format:', f);
          return '';
        }
      }).filter(f => f.trim() !== '');
      
      // S'assurer qu'il y a au moins une feature vide pour l'ajout
      if (processedFeatures.length === 0) {
        processedFeatures = [''];
      }
    }
    
    // Traitement sécurisé des gradients
    const safeHeaderGradient = pack.headerGradient && typeof pack.headerGradient === 'object' 
      ? pack.headerGradient 
      : { start: '#0062E6', end: '#33AEFF' };
    
    const safeButtonGradient = pack.buttonGradient && typeof pack.buttonGradient === 'object'
      ? pack.buttonGradient
      : { start: '#0062E6', end: '#33AEFF' };
    
    const safeButtonHoverGradient = pack.buttonHoverGradient && typeof pack.buttonHoverGradient === 'object'
      ? pack.buttonHoverGradient
      : { start: '#0062E6', end: '#0062E6' };
    
    setFormData({
      pack_id: pack.pack_id || pack.id || '',
      name: pack.name || '',
      price: pack.price ? pack.price.toString() : '',
      priceInCents: pack.priceInCents ? pack.priceInCents.toString() : '',
      usages: pack.usages ? pack.usages.toString() : '',
      color: pack.color || 'standard',
      isPopular: Boolean(pack.isPopular),
      stripeProductId: pack.stripeProductId || '',
      headerGradient: safeHeaderGradient,
      buttonGradient: safeButtonGradient,
      buttonHoverGradient: safeButtonHoverGradient,
      buttonText: pack.buttonText || 'Payer maintenant',
      isActive: pack.isActive !== undefined ? Boolean(pack.isActive) : true,
      features: processedFeatures
    });
    
    setEditingPack(pack);
    setOpenDialog(true);
  };

  // Save pack (create or update)
  const handleSavePack = async () => {
    try {
      // console.log('Saving pack with form data:', formData);
      
      // Validation basique côté client
      if (!formData.pack_id.trim()) {
        showSnackbar('L\'ID du pack est requis', 'error');
        return;
      }
      
      if (!formData.name.trim()) {
        showSnackbar('Le nom du pack est requis', 'error');
        return;
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price))) {
        showSnackbar('Le prix doit être un nombre valide', 'error');
        return;
      }
      
      // Filtrer les features vides
      const validFeatures = formData.features.filter(f => f.trim() !== '');
      if (validFeatures.length === 0) {
        showSnackbar('Au moins une fonctionnalité est requise', 'error');
        return;
      }
      
      // Préparer les données pour l'API
      const packData = {
        pack_id: formData.pack_id.trim(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        priceInCents: Math.round(parseFloat(formData.price) * 100),
        usages: parseInt(formData.usages) || 0,
        color: formData.color,
        isPopular: Boolean(formData.isPopular),
        stripeProductId: formData.stripeProductId.trim(),
        headerGradient: formData.headerGradient,
        buttonGradient: formData.buttonGradient,
        buttonHoverGradient: formData.buttonHoverGradient,
        isActive: Boolean(formData.isActive),
        features: validFeatures.map(f => ({ featureText: f.trim() }))
      };
      
      // console.log('Formatted pack data for API:', packData);

      if (editingPack) {
        // Update existing pack
        const packId = editingPack.id || editingPack.pack_id;
        // console.log('Updating pack with ID:', packId);
        await subscriptionPackService.updatePack(packId, packData);
        showSnackbar('Pack mis à jour avec succès');
        
        // Synchroniser automatiquement les usages des utilisateurs après la mise à jour
        try {
          const syncResult = await syncService.syncAllUserUsages();
          // console.log('Synchronisation automatique réussie:', syncResult);
        } catch (syncError) {
          console.error('Erreur lors de la synchronisation automatique:', syncError);
          // Ne pas bloquer le processus si la synchronisation échoue
        }
      } else {
        // Create new pack
        // console.log('Creating new pack');
        await subscriptionPackService.createPack(packData);
        showSnackbar('Pack créé avec succès');
      }

      setOpenDialog(false);
      resetForm();
      await loadPacks(); // Attendre le rechargement
    } catch (error) {
      console.error('Error saving pack:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la sauvegarde';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Synchroniser les usages des utilisateurs
  const handleSyncUsages = async () => {
    try {
      setSyncingUsages(true);
      const result = await syncService.syncAllUserUsages();
      showSnackbar(`Synchronisation réussie: ${result.updated_users?.length || 0} utilisateurs mis à jour`);
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      showSnackbar('Erreur lors de la synchronisation des usages', 'error');
    } finally {
      setSyncingUsages(false);
    }
  };

  // Toggle pack status
  const handleToggleStatus = async (packId) => {
    try {
      // console.log('Toggling status for pack:', packId);
      await subscriptionPackService.togglePackStatus(packId);
      showSnackbar('Statut du pack modifié');
      await loadPacks(); // Attendre le rechargement
    } catch (error) {
      console.error('Error toggling pack status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la modification du statut';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Delete pack
  const handleDeletePack = async (packId) => {
    try {
      await subscriptionPackService.deletePack(packId);
      showSnackbar('Pack supprimé avec succès');
      setDeleteConfirmDialog({ open: false, packId: null });
      loadPacks();
    } catch (error) {
      showSnackbar('Erreur lors de la suppression', 'error');
    }
  };

  // Get color options
  const colorOptions = subscriptionPackService.getColorOptions();

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <MDTypography variant="h6">Chargement...</MDTypography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <MDTypography variant="h4" fontWeight="medium">
                Gestion des Packs d'Abonnement
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={1}>
                Gérez les packs d'abonnement, leurs prix, fonctionnalités et statuts
              </MDTypography>
            </Box>
            <Button
              variant="outlined"
              color="info"
              startIcon={syncingUsages ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={handleSyncUsages}
              disabled={syncingUsages}
              sx={{ minWidth: 200 }}
            >
              {syncingUsages ? 'Synchronisation...' : 'Synchroniser les usages'}
            </Button>
          </Box>
        </MDBox>

        {/* Packs Grid */}
        <Grid container spacing={3}>
          {packs.map((pack) => (
            <Grid item xs={12} md={6} lg={4} key={pack.id}>
              <PackCard isActive={pack.isActive} isPopular={pack.isPopular}>
                <GradientHeader 
                  gradientStart={pack.headerGradient?.start || '#0062E6'}
                  gradientEnd={pack.headerGradient?.end || '#33AEFF'}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      {pack.name}
                    </Typography>
                    {pack.isPopular && (
                      <Chip 
                        icon={<StarIcon />} 
                        label="Populaire" 
                        size="small" 
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      />
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight="bold" mt={1}>
                    {pack.price}€
                  </Typography>
                  <Typography variant="body2" opacity={0.9}>
                    {pack.usages} examens
                  </Typography>
                </GradientHeader>

                <CardContent>
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID: {pack.pack_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Stripe: {pack.stripeProductId}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <ColorPreview color={pack.headerGradient?.start || '#0062E6'} />
                      <Typography variant="body2" color="text.secondary">
                        {pack.color}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Fonctionnalites:
                  </Typography>
                  <List dense>
                    {pack.features?.slice(0, 3).map((feature, index) => (
                      <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                        <ListItemText 
                          primary={typeof feature === 'object' ? feature.featureText : feature}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {pack.features?.length > 3 && (
                      <ListItem sx={{ py: 0.5, px: 0 }}>
                        <ListItemText 
                          primary={`+${pack.features.length - 3} autres...`}
                          primaryTypographyProps={{ variant: 'body2', fontStyle: 'italic' }}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box>
                      <Tooltip title={pack.isActive ? 'Actif' : 'Inactif'}>
                        <IconButton 
                          onClick={() => handleToggleStatus(pack.id)}
                          color={pack.isActive ? 'success' : 'default'}
                        >
                          {pack.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton onClick={() => handleEditPack(pack)} color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton 
                          onClick={() => setDeleteConfirmDialog({ open: true, packId: pack.id })}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Chip 
                      label={pack.isActive ? 'Actif' : 'Inactif'}
                      color={pack.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </PackCard>
            </Grid>
          ))}
        </Grid>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleCreatePack}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
          }}
        >
          <AddIcon />
        </Fab>

        {/* Create/Edit Dialog */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingPack ? 'Modifier le Pack' : 'Créer un Nouveau Pack'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <FeaturesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Informations de base
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID du Pack"
                  value={formData.pack_id}
                  onChange={(e) => handleInputChange('pack_id', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom du Pack"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Prix (€)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Prix en centimes"
                  type="number"
                  value={formData.priceInCents}
                  onChange={(e) => handleInputChange('priceInCents', e.target.value)}
                  required
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Nombre d'examens"
                  type="number"
                  value={formData.usages}
                  onChange={(e) => handleInputChange('usages', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Couleur</InputLabel>
                  <Select
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    label="Couleur"
                  >
                    {colorOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center">
                          <ColorPreview color={option.color} />
                          {option.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ID Produit Stripe"
                  value={formData.stripeProductId}
                  onChange={(e) => handleInputChange('stripeProductId', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPopular}
                      onChange={(e) => handleInputChange('isPopular', e.target.checked)}
                    />
                  }
                  label="Pack populaire"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    />
                  }
                  label="Pack actif"
                />
              </Grid>

              {/* Gradient Colors */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  <ColorLensIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Couleurs des dégradés
                </Typography>
              </Grid>

              {/* Header Gradient */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="En-tête - Début"
                  type="color"
                  value={formData.headerGradient.start}
                  onChange={(e) => handleGradientChange('headerGradient', 'start', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="En-tête - Fin"
                  type="color"
                  value={formData.headerGradient.end}
                  onChange={(e) => handleGradientChange('headerGradient', 'end', e.target.value)}
                />
              </Grid>

              {/* Button Gradient */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bouton - Début"
                  type="color"
                  value={formData.buttonGradient.start}
                  onChange={(e) => handleGradientChange('buttonGradient', 'start', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bouton - Fin"
                  type="color"
                  value={formData.buttonGradient.end}
                  onChange={(e) => handleGradientChange('buttonGradient', 'end', e.target.value)}
                />
              </Grid>

              {/* Button Hover Gradient */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bouton Hover - Début"
                  type="color"
                  value={formData.buttonHoverGradient.start}
                  onChange={(e) => handleGradientChange('buttonHoverGradient', 'start', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bouton Hover - Fin"
                  type="color"
                  value={formData.buttonHoverGradient.end}
                  onChange={(e) => handleGradientChange('buttonHoverGradient', 'end', e.target.value)}
                />
              </Grid>

              {/* Button Text */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Texte du bouton"
                  value={formData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="Payer maintenant"
                  helperText="Texte affiché sur le bouton d'achat"
                />
              </Grid>

              {/* Features */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  <FeaturesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Fonctionnalites
                </Typography>
              </Grid>

              {formData.features.map((feature, index) => (
                <Grid item xs={12} key={index}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      fullWidth
                      label={`Fonctionnalite ${index + 1}`}
                      value={typeof feature === 'object' ? feature.featureText || '' : feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      multiline
                      rows={2}
                    />
                    {formData.features.length > 1 && (
                      <IconButton 
                        onClick={() => removeFeature(index)}
                        color="error"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))}

              <Grid item xs={12}>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addFeature}
                  variant="outlined"
                >
                  Ajouter une fonctionnalité
                </Button>
              </Grid>

              {/* Preview */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Apercu
                </Typography>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden', maxWidth: 300 }}>
                  <GradientHeader 
                    gradientStart={formData.headerGradient.start}
                    gradientEnd={formData.headerGradient.end}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {formData.name || 'Nom du Pack'}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {formData.price || '0'}€
                    </Typography>
                    <Typography variant="body2" opacity={0.9}>
                      {formData.usages || '0'} examens
                    </Typography>
                  </GradientHeader>
                  <Box p={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        background: `linear-gradient(135deg, ${formData.buttonGradient.start}, ${formData.buttonGradient.end})`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${formData.buttonHoverGradient.start}, ${formData.buttonHoverGradient.end})`,
                        }
                      }}
                    >
                      Choisir ce pack
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} startIcon={<CancelIcon />}>
              Annuler
            </Button>
            <Button 
              onClick={handleSavePack} 
              variant="contained" 
              startIcon={<SaveIcon />}
              style={{color:"#fff"}}
            >
              {editingPack ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmDialog.open}
          onClose={() => setDeleteConfirmDialog({ open: false, packId: null })}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer ce pack ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmDialog({ open: false, packId: null })}>
              Annuler
            </Button>
            <Button 
              onClick={() => handleDeletePack(deleteConfirmDialog.packId)}
              color="error"
              variant="contained"
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PackManagement;