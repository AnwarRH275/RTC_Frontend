/**
=========================================================
* Réussir TCF Canada - v1.0.0
* Interface de Gestion Financière Admin
=========================================================
*/

// react-router-dom components
import { useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Divider
} from "@mui/material";

// @mui icons
import {
  Refresh,
  FilterList,
  GetApp,
  Cancel,
  Undo,
  Visibility,
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  People,
  DateRange
} from "@mui/icons-material";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable"; 
import ordersTableData from "layouts/billing/data/ordersTableData";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from '../../services/config';
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

function FinancialManagement() {
  const navigate = useNavigate();

  // États pour les données
  const [allOrders, setAllOrders] = useState([]); // Toutes les commandes
  const [filteredOrders, setFilteredOrders] = useState([]); // Commandes filtrées
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    statusStats: {
      paid: 0,
      cancelled: 0,
      failed: 0,
      pending: 0,
      refunded: 0,
    },
    planStats: {},
    monthlyStats: [],
  });

  // États pour l'interface
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // États pour la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);

  // États pour les dialogues
  const [cancelDialog, setCancelDialog] = useState({ open: false, order: null });
  const [refundDialog, setRefundDialog] = useState({ open: false, order: null });
  const [viewDialog, setViewDialog] = useState({ open: false, order: null });

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };



  // Fonction pour appliquer les filtres côté frontend
  const applyFilters = () => {
    let filtered = [...allOrders];

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtre par date (utilise paidAt au lieu de created_at)
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(order => {
        if (!order.paidAt) return false; // Exclure les commandes sans date de paiement
        const orderDate = new Date(order.paidAt);
        return orderDate >= fromDate;
      });
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Inclure toute la journée
      filtered = filtered.filter(order => {
        if (!order.paidAt) return false; // Exclure les commandes sans date de paiement
        const orderDate = new Date(order.paidAt);
        return orderDate <= toDate;
      });
    }

    // Filtre par recherche
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower) ||
        order.subscriptionPlan?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredOrders(filtered);
    setTotalOrders(filtered.length);
    setPage(0); // Reset à la première page
  };

  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
  };

  // Obtenir les commandes paginées pour l'affichage
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const { columns, rows } = ordersTableData(paginatedOrders, {
    show: (order) => setViewDialog({ open: true, order }),
    cancel: (order) => setCancelDialog({ open: true, order }),
    refund: (order) => setRefundDialog({ open: true, order }),
  });

  // Fonction pour récupérer le token d'authentification
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fonction pour formater les dates pour l'API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    
    try {
      // Créer un objet Date à partir de la chaîne de date
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.error('Date invalide:', dateString);
        return '';
      }
      
      // Formater la date au format YYYY-MM-DD
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return '';
    }
  };

  // Fonction pour récupérer toutes les commandes (sans filtres côté serveur)
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      
      // Récupérer toutes les commandes sans filtres
      const params = new URLSearchParams({
        page: 1,
        per_page: 1000 // Récupérer un grand nombre de commandes
      });

      const response = await fetch(`${API_BASE_URL}/order-admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes');
      }

      const data = await response.json();
      setAllOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les statistiques
  const fetchStatistics = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/order-admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      
      // S'assurer que toutes les propriétés nécessaires sont présentes
      const formattedStats = {
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        averageOrderValue: data.averageOrderValue || 0,
        statusStats: {
          paid: data.statusStats?.paid || 0,
          cancelled: data.statusStats?.cancelled || 0,
          failed: data.statusStats?.failed || 0,
          pending: data.statusStats?.pending || 0,
          refunded: data.statusStats?.refunded || 0
        },
        planStats: data.planStats || {},
        monthlyStats: data.monthlyStats || []
      };
      
      setStatistics(formattedStats);
    } catch (err) {
      console.error('Erreur statistiques:', err);
      setError('Impossible de charger les statistiques');
    }
  };

  // Fonction pour annuler une commande
  const cancelOrder = async (orderId, resetBalance = false) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/order-admin/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reset_user_balance: resetBalance })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de la commande');
      }

      setSuccess('Commande annulée avec succès');
      fetchAllOrders();
      fetchStatistics();
      setCancelDialog({ open: false, order: null });
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour rembourser une commande
  const refundOrder = async (orderId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/order-admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du remboursement');
      }

      setSuccess('Remboursement effectué avec succès');
      fetchAllOrders();
      fetchStatistics();
      setRefundDialog({ open: false, order: null });
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour exporter les données filtrées
  const exportOrders = () => {
    try {
      // Créer le contenu CSV à partir des données filtrées
      const headers = ['N° Commande', 'Client', 'Pack', 'Montant', 'Statut', 'Date'];
      const csvContent = [
        headers.join(','),
        ...filteredOrders.map(order => [
          order.orderNumber || '',
          order.customerEmail || '',
          order.subscriptionPlan || '',
          `${order.amount} ${order.currency}`,
          getStatusLabel(order.status),
          formatDate(order.paidAt || order.createdAt)
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Export terminé avec succès');
    } catch (err) {
      setError('Erreur lors de l\'exportation');
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      case 'refunded': return 'info';
      default: return 'default';
    }
  };

  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'En attente';
      case 'failed': return 'Échec';
      case 'cancelled': return 'Annulé';
      case 'refunded': return 'Remboursé';
      default: return status;
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fonction pour formater le montant
  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Effet pour charger les données au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when debounced search changes
  const isInitialSearchMount = useRef(true);
  useEffect(() => {
    if (isInitialSearchMount.current) {
      isInitialSearchMount.current = false;
    } else {
      setPage(0);
    }
  }, [debouncedSearch]);

  // Charger toutes les données au montage
  useEffect(() => {
    fetchAllOrders();
    fetchStatistics();
  }, []);

  // Appliquer les filtres quand les critères changent
  useEffect(() => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      setError("La date de début doit être antérieure à la date de fin");
      return;
    }
    applyFilters();
  }, [allOrders, statusFilter, dateFrom, dateTo, debouncedSearch]);

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setDebouncedSearch('');
    setPage(0);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="dark"
                  icon="weekend"
                  title="Total Revenue"
                  count={statistics.totalRevenue}
                  percentage={{
                    color: "success",
                    amount: "+55%",
                    label: "than last week",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  icon="leaderboard"
                  title="Total Orders"
                  count={statistics.totalOrders}
                  percentage={{
                    color: "success",
                    amount: "+3%",
                    label: "than last month",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Average Order Value"
                  count={statistics.averageOrderValue}
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "than yesterday",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="person_add"
                  title="Status Stats"
                  count={Object.values(statistics.statusStats).reduce((a, b) => a + b, 0)}
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Just updated",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
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
                >
                  <MDTypography variant="h6" color="white">
                    Tableau des Commandes
                  </MDTypography>
                </MDBox>
                <MDBox p={3} lineHeight={1}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDBox display="flex" gap={2} flexWrap="wrap">
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Statut</InputLabel>
                        <Select value={statusFilter} onChange={handleStatusFilterChange} label="Statut">
                          <MenuItem value="all">Tous</MenuItem>
                          <MenuItem value="paid">Payé</MenuItem>
                          <MenuItem value="cancelled">Annulé</MenuItem>
                          <MenuItem value="failed">Échoué</MenuItem>
                          <MenuItem value="pending">En attente</MenuItem>
                          <MenuItem value="refunded">Remboursé</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        type="date"
                        label="De"
                        value={dateFrom}
                        onChange={handleDateFromChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <TextField
                        type="date"
                        label="À"
                        value={dateTo}
                        onChange={handleDateToChange}
                        InputLabelProps={{ shrink: true }}
                        size="small"
                      />
                      <TextField
                        label="Rechercher"
                        placeholder="ID, email, nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                      />
                    </MDBox>
                    <MDBox display="flex" gap={1}>
                      <MDButton variant="outlined" color="secondary" size="small" onClick={resetFilters}>
                        Réinitialiser
                      </MDButton>
                      <MDButton variant="outlined" color="info" size="small" onClick={fetchAllOrders}>
                        <Refresh />
                        &nbsp;Rafraîchir
                      </MDButton>
                      <MDButton variant="gradient" color="info" size="small" onClick={exportOrders}>
                        <GetApp />
                        &nbsp;Exporter
                      </MDButton>
                    </MDBox>
                  </MDBox>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead sx={{ display: "table-header-group" }}>
                        <TableRow>
                          {columns.map((col) => (
                            <TableCell key={col.accessor} align={col.align || 'left'}>{col.Header}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                              <CircularProgress />
                            </TableCell>
                          </TableRow>
                        ) : rows.length > 0 ? (
                          rows.map((row) => (
                            <TableRow key={row.id}>
                              {columns.map((col) => (
                                <TableCell key={col.accessor} align={col.align || 'left'}>
                                  {row[col.accessor]}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                              Aucune commande trouvée.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={totalOrders}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />

      {/* Dialog de détails */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, order: null })} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la commande</DialogTitle>
        <DialogContent>
          {viewDialog.order && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" color="text">Numéro de commande:</MDTypography>
                <MDTypography variant="body2" mb={2}>{viewDialog.order.orderNumber}</MDTypography>

                <MDTypography variant="subtitle2" color="text">Client:</MDTypography>
                <MDTypography variant="body2" mb={1}>{viewDialog.order.customerName}</MDTypography>
                <MDTypography variant="body2" mb={2}>{viewDialog.order.customerEmail}</MDTypography>

                <MDTypography variant="subtitle2" color="text">Téléphone:</MDTypography>
                <MDTypography variant="body2" mb={2}>{viewDialog.order.customer_phone || 'Non renseigné'}</MDTypography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <MDTypography variant="subtitle2" color="text">Pack souscrit:</MDTypography>
                <MDTypography variant="body2" mb={2}>{viewDialog.order.subscriptionPlan}</MDTypography>

                <MDTypography variant="subtitle2" color="text">Montant:</MDTypography>
                <MDTypography variant="body2" mb={2}>
                  {formatAmount(viewDialog.order.amount, viewDialog.order.currency)}
                </MDTypography>

                <MDTypography variant="subtitle2" color="text">Statut:</MDTypography>
                <Chip
                  label={getStatusLabel(viewDialog.order.status)}
                  color={getStatusColor(viewDialog.order.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <MDTypography variant="subtitle2" color="text">Informations de paiement:</MDTypography>
                <MDTypography variant="body2" mb={1}>Méthode: {viewDialog.order.payment_method}</MDTypography>
                <MDTypography variant="body2" mb={1}>ID Stripe Session: {viewDialog.order.stripe_session_id}</MDTypography>
                <MDTypography variant="body2" mb={2}>ID Payment Intent: {viewDialog.order.stripe_payment_intent_id}</MDTypography>

                <MDTypography variant="subtitle2" color="text">Dates:</MDTypography>
                <MDTypography variant="body2" mb={1}>Créée le: {formatDate(viewDialog.order.createdAt)}</MDTypography>
                <MDTypography variant="body2" mb={1}>Mise à jour: {formatDate(viewDialog.order.updatedAt)}</MDTypography>
                {viewDialog.order.paidAt && (
                  <MDTypography variant="body2" mb={1}>Payée le: {formatDate(viewDialog.order.paidAt)}</MDTypography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" color="secondary" onClick={() => setViewDialog({ open: false, order: null })}>
            Fermer
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog d'annulation */}
      <Dialog open={cancelDialog.open} onClose={() => setCancelDialog({ open: false, order: null })}>
        <DialogTitle>Annuler la commande</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" mb={2}>
            Êtes-vous sûr de vouloir annuler la commande <strong>{cancelDialog.order?.order_number}</strong> ?
          </MDTypography>
          <MDTypography variant="body2" color="warning">
            Cette action remettra à zéro le solde du client et ne peut pas être annulée.
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" color="secondary" onClick={() => setCancelDialog({ open: false, order: null })}>
            Annuler
          </MDButton>
          <MDButton variant="contained" color="error" onClick={() => cancelOrder(cancelDialog.order?.id, true)}>
            Confirmer l'annulation
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Dialog de remboursement */}
      <Dialog open={refundDialog.open} onClose={() => setRefundDialog({ open: false, order: null })}>
        <DialogTitle>Rembourser la commande</DialogTitle>
        <DialogContent>
          <MDTypography variant="body2" mb={2}>
            Êtes-vous sûr de vouloir rembourser la commande <strong>{refundDialog.order?.order_number}</strong> ?
          </MDTypography>
          <MDTypography variant="body2" color="info">
            Le remboursement sera traité via Stripe et le solde du client sera ajusté.
          </MDTypography>
        </DialogContent>
        <DialogActions>
          <MDButton variant="outlined" color="secondary" onClick={() => setRefundDialog({ open: false, order: null })}>
            Annuler
          </MDButton>
          <MDButton variant="contained" color="info" onClick={() => refundOrder(refundDialog.order?.id)}>
            Confirmer le remboursement
          </MDButton>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError("")} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess("")} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSuccess("")} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default FinancialManagement;
