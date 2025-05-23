/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useEffect, useState, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";


import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDAlert from "components/MDAlert";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import TCFAdminService from "services/tcfAdminService";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function TCFAdminSimulator() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, message: "", color: "info" });

  // États pour les filtres
  const [filters, setFilters] = useState({
    status: "tous",
    plans: "tous",
    dateFrom: "",
    dateTo: "",
    searchTerm: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // État pour les sujets TCF Écrit
  const [writtenSubjects, setWrittenSubjects] = useState([
    {
      id: 1,
      name: "Environnement et développement durable",
      date: "2023-10-15",
      plans: "Pack Écrit Performance",
      status: "Actif", // Ajout de l'état initial
      duration: 60, // Ajout de la durée initiale
      tasks: [
        {
          id: 1,
          title: "Description d'un problème environnemental",
          structure: "Introduction, développement avec 2 exemples, conclusion",
          wordCount: 120,
        },
        {
          id: 2,
          title: "Solutions pour réduire l'empreinte carbone",
          structure: "Présentation du problème, 3 solutions, conclusion",
          wordCount: 180,
        },
        {
          id: 3,
          title: "Lettre à un responsable politique",
          structure: "Formule d'appel, présentation du problème, demande d'action, formule de politesse",
          wordCount: 150,
        },
      ],
    },
    {
      id: 2,
      name: "Technologie et société",
      date: "2023-11-20",
      plans: "Pack Écrit Pro",
      status: "Actif", // Ajout de l'état initial
      duration: 60, // Ajout de la durée initiale
      tasks: [
        { 
          id: 1, 
          title: "", 
          structure: "", 
          instructions: "", 
          minWordCount: 60, 
          wordCount: 150, 
          duration: 3, 
          documentsDeReference: "" // Ajouter le champ documentsDeReference
        },
        {
          id: 2,
          title: "Avenir de l'intelligence artificielle",
          structure: "Introduction, développements actuels, perspectives futures, conclusion",
          wordCount: 200,
        },
        {
          id: 3,
          title: "Débat sur l'éthique technologique",
          structure: "Présentation du sujet, arguments pour, arguments contre, position personnelle",
          wordCount: 180,
        },
      ],
    },
  ]);

  // État pour les sujets TCF Oral
  const [oralSubjects, setOralSubjects] = useState([
    {
      id: 1,
      name: "Vie quotidienne au Canada",
      date: "2023-09-05",
      plans: "Pack Écrit Standard",
      status: "Actif", // Ajout de l'état initial
      duration: 60, // Ajout de la durée initiale
      tasks: [
        {
          id: 1,
          title: "Présentation personnelle",
          structure: "Salutation, informations personnelles, raisons de l'immigration, conclusion",
          duration: 2,
        },
        {
          id: 2,
          title: "Description d'une journée typique",
          structure: "Introduction, activités du matin, après-midi, soir, conclusion",
          duration: 3,
        },
        {
          id: 3,
          title: "Comparaison avec le pays d'origine",
          structure: "Introduction, similitudes, différences, préférences personnelles",
          duration: 3,
        },
      ],
    },
    {
      id: 2,
      name: "Culture et traditions",
      date: "2023-12-10",
      plans: "Pack Écrit Performance",
      status: "Actif", // Ajout de l'état initial
      duration: 60, // Ajout de la durée initiale
      tasks: [
        {
          id: 1,
          title: "Fêtes traditionnelles",
          structure: "Introduction, description d'une fête, importance culturelle, conclusion",
          duration: 2,
        },
        {
          id: 2,
          title: "Cuisine et gastronomie",
          structure: "Présentation d'un plat typique, ingrédients, préparation, signification culturelle",
          duration: 3,
        },
        {
          id: 3,
          title: "Débat sur l'intégration culturelle",
          structure: "Introduction du sujet, arguments, exemples personnels, conclusion",
          duration: 4,
        },
      ],
    },
  ]);

  // État pour le formulaire d'ajout/modification
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split("T")[0],
    plans: "Pack Écrit Performance",
    status: "Actif", 
    duration: 60, 
    combination: "", 
    blog: "", 
    tasks: [
      { 
        id: 1, 
        title: "", 
        structure: "", 
        instructions: "", 
        minWordCount: 60, 
        wordCount: 150, 
        duration: 3 
      },
    ],
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Réinitialiser les filtres lors du changement d'onglet
    setFilters({
      status: "tous",
      plans: "tous",
      dateFrom: "",
      dateTo: "",
      searchTerm: ""
    });
  };


  // Ajouter un effet pour charger les données au chargement du composant
useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Charger les sujets écrits
        const writtenData = await TCFAdminService.getAllSubjects('Écrit');
        setWrittenSubjects(writtenData);
        
        // Charger les sujets oraux
        const oralData = await TCFAdminService.getAllSubjects('Oral');
        setOralSubjects(oralData);
      } catch (error) {
        console.error("Erreur lors du chargement des sujets:", error);
        setAlertInfo({
          show: true,
          message: "Erreur lors du chargement des sujets",
          color: "error",
        });
      }
    };
    
    fetchSubjects();
  }, []); // Ajouter le tableau de dépendances vide ici

  // Gestion des filtres
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Fonction pour filtrer les sujets
  const filterSubjects = (subjects) => {
    return subjects.filter((subject) => {
      // Filtre par statut
      if (filters.status !== "tous" && subject.status !== filters.status) {
        return false;
      }

      // Filtre par Plan abonnement
      if (filters.plans !== "tous" && subject.plans !== filters.plans) {
        return false;
      }

      // Filtre par date (de)
      if (filters.dateFrom && new Date(subject.date) < new Date(filters.dateFrom)) {
        return false;
      }

      // Filtre par date (à)
      if (filters.dateTo && new Date(subject.date) > new Date(filters.dateTo)) {
        return false;
      }

      // Filtre par terme de recherche (nom du sujet ou titre des tâches)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = subject.name.toLowerCase().includes(searchLower);
        const taskMatch = subject.tasks.some(task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.structure.toLowerCase().includes(searchLower)
        );
        if (!nameMatch && !taskMatch) {
          return false;
        }
      }

      return true;
    });
  };

  const handleOpenDialog = (isEdit = false, subject = null) => {
    if (isEdit && subject) {
      // Assurez-vous que chaque tâche a tous les champs nécessaires
      const updatedTasks = subject.tasks.map(task => ({
        ...task,
        instructions: task.instructions || "",
        minWordCount: task.minWordCount || (tabValue === 0 ? 60 : 0)
      }));
      
      setFormData({
        ...subject,
        status: subject.status || "Actif",
        duration: subject.duration || 60,
        combination: subject.combination || "",
        blog: subject.blog || "",
        tasks: updatedTasks,
      });
      setCurrentSubject(subject);
      setIsEditing(true);
    } else {
      setFormData({
        name: "",
        date: new Date().toISOString().split("T")[0],
        plans: "Pack Écrit Performance",
        status: "Actif",
        duration: 60,
        combination: "",
        blog: "",
        tasks: [
          { 
            id: 1, 
            title: "", 
            structure: "", 
            instructions: "", 
            minWordCount: tabValue === 0 ? 60 : 0, 
            wordCount: 150, 
            duration: 3 
          },
        ],
      });
      setCurrentSubject(null);
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...formData.tasks];
    // Check if the value has actually changed before updating state
    if (updatedTasks[index][field] !== value) {
      updatedTasks[index] = {
        ...updatedTasks[index],
        [field]: value,
      };
      setFormData({
        ...formData,
        tasks: updatedTasks,
      });
    }
  };

const handleSaveSubject = async () => {
  // Validation basique
  if (!formData.name || formData.name.trim() === "") {
    setAlertInfo({
      show: true,
      message: "Veuillez saisir un nom pour le sujet",
      color: "error",
    });
    setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
    return;
  }

  // Vérifier que toutes les tâches ont un titre et une structure
  const invalidTask = formData.tasks.find(task => !task.title || !task.structure);
  if (invalidTask) {
    setAlertInfo({
      show: true,
      message: "Veuillez compléter toutes les tâches avec un titre et une structure",
      color: "error",
    });
    setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
    return;
  }

  try {
    // Préparer les données pour l'API
    const apiData = {
      ...formData,
      subject_type: 'Écrit', // Toujours définir comme 'Écrit'
      subscription_plan: formData.plans, // Adapter le nom du champ
      tasks: formData.tasks.map(task => ({
        title: task.title,
        structure: task.structure,
        instructions: task.instructions || "",
        min_word_count: task.minWordCount || 0,
        word_count: task.wordCount || 0,
        duration: task.duration || 0,
        documents_de_reference: task.documents_de_reference || ""
      }))
    };

    if (isEditing && currentSubject) {
      // Mise à jour d'un sujet existant
      await TCFAdminService.updateSubject(currentSubject.id, apiData);
      
      // Recharger les sujets pour avoir les données à jour
      if (tabValue === 0) {
        const writtenData = await TCFAdminService.getAllSubjects('Écrit');
        setWrittenSubjects(writtenData);
      } else {
        const oralData = await TCFAdminService.getAllSubjects('Oral');
        setOralSubjects(oralData);
      }
    } else {
      // Création d'un nouveau sujet
      await TCFAdminService.createSubject(apiData);
      
      // Recharger les sujets pour avoir les données à jour
      if (tabValue === 0) {
        const writtenData = await TCFAdminService.getAllSubjects('Écrit');
        setWrittenSubjects(writtenData);
      } else {
        const oralData = await TCFAdminService.getAllSubjects('Oral');
        setOralSubjects(oralData);
      }
    }

    setAlertInfo({
      show: true,
      message: isEditing ? "Sujet mis à jour avec succès" : "Sujet créé avec succès",
      color: "success",
    });
    setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
    handleCloseDialog();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du sujet:", error);
    setAlertInfo({
      show: true,
      message: `Erreur: ${error.message || "Problème lors de l'enregistrement"}`,
      color: "error",
    });
    setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
  }
};

const handleDeleteSubject = async (id) => {
  if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sujet ?")) {
    try {
      await TCFAdminService.deleteSubject(id);
      
      // Mettre à jour la liste des sujets
      if (tabValue === 0) {
        const writtenData = await TCFAdminService.getAllSubjects('Écrit');
        setWrittenSubjects(writtenData);
      } else {
        const oralData = await TCFAdminService.getAllSubjects('Oral');
        setOralSubjects(oralData);
      }
      
      setAlertInfo({
        show: true,
        message: "Sujet supprimé avec succès",
        color: "success",
      });
      setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression du sujet:", error);
      setAlertInfo({
        show: true,
        message: `Erreur: ${error.message || "Problème lors de la suppression"}`,
        color: "error",
      });
      setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
    }
  }
};


  // Définir les colonnes pour le DataTable
  const columns = [
    { Header: "Nom du sujet", accessor: "name", width: "15%", align: "left" },
    { Header: "Combinaison", accessor: "combination", width: "15%", align: "left" },
    { Header: "Description", accessor: "blog", width: "20%", align: "left" },
    { Header: "État", accessor: "status", align: "center" },
    { Header: "Durée (minutes)", accessor: "duration", align: "center" },
    { Header: "Plan abonnement", accessor: "plans", align: "center" },
    { Header: "Nombre de tâches", accessor: "taskCount", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  // Préparer les données pour le DataTable
  const prepareRows = (subjects) => {
    return subjects.map((subject) => ({
      combination: (
        <MDTypography variant="button" fontWeight="medium">
          {subject.combination || ""}
        </MDTypography>
      ),
      name: (
        <MDTypography variant="button" fontWeight="medium" dangerouslySetInnerHTML={{ __html: subject.name }} />
      ),
      blog: (
        <MDTypography variant="button" fontWeight="medium" dangerouslySetInnerHTML={{ __html: subject.blog || "" }} />
      ),
      status: (
        <MDTypography variant="button" fontWeight="medium">
          {subject.status}
        </MDTypography>
      ),
      duration: (
        <MDTypography variant="button" fontWeight="medium">
          {subject.duration}
        </MDTypography>
      ),
      plans: (
        <MDTypography variant="button" fontWeight="medium">
          {subject.plans}
        </MDTypography>
      ),
      taskCount: (
        <MDTypography variant="button" fontWeight="medium">
          {subject.tasks.length}
        </MDTypography>
      ),
      actions: (
        <MDBox display="flex" alignItems="center">
          <MDButton
            variant="text"
            color="info"
            onClick={() => handleOpenDialog(true, subject)}
          >
            <Icon>edit</Icon>&nbsp;Modifier
          </MDButton>
          <MDButton
            variant="text"
            color="error"
            onClick={() => handleDeleteSubject(subject.id)}
          >
            <Icon>delete</Icon>&nbsp;Supprimer
          </MDButton>
        </MDBox>
      ),
    }));
  };

  const writtenRows = prepareRows(filterSubjects(writtenSubjects));
  const oralRows = prepareRows(filterSubjects(oralSubjects));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        {alertInfo.show && (
          <MDAlert color={alertInfo.color} dismissible>
            {alertInfo.message}
          </MDAlert>
        )}

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
              >
                <MDTypography variant="h4" color="white">
                  Gestion des Simulateurs TCF
                </MDTypography>
                <MDButton
                  variant="gradient"
                  color="light"
                  onClick={() => handleOpenDialog(false)}
                >
                  <Icon>add</Icon>&nbsp;
                  Ajouter un examen
                </MDButton>
              </MDBox>

              <MDBox p={3}>
                <MDBox display="flex" flexDirection="column" width="100%">
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      textColor="primary"
                      indicatorColor="primary"
                      centered
                      sx={{ flex: 1 }}
                    >
                  <Tab
                    label={
                      <MDBox display="flex" alignItems="center">
                        <Icon>description</Icon>
                        <MDTypography variant="button" ml={1}>
                          Gestion expression Écrit
                        </MDTypography>
                      </MDBox>
                    }
                  />
                  <Tab
                    label={
                      <MDBox display="flex" alignItems="center">
                        <Icon>record_voice_over</Icon>
                        <MDTypography variant="button" ml={1}>
                          Gestion expression Oral
                        </MDTypography>
                      </MDBox>
                    }
                  />
                    </Tabs>
                    <MDButton
                      variant="outlined"
                      color="info"
                      onClick={toggleFilters}
                      startIcon={<Icon>{showFilters ? "filter_list_off" : "filter_list"}</Icon>}
                      size="small"
                    >
                      {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
                    </MDButton>
                  </MDBox>

                  {/* Section de filtrage */}
                  {showFilters && (
                    <MDBox
                      p={2}
                      mb={3}
                      bgcolor="background.paper"
                      borderRadius="lg"
                      boxShadow={2}
                      display="flex"
                      flexWrap="wrap"
                      gap={2}
                    >
                      <MDBox width={{ xs: "100%", sm: "47%", md: "30%" }}>
                        <MDInput
                          fullWidth
                          placeholder="Rechercher..."
                          name="searchTerm"
                          value={filters.searchTerm}
                          onChange={handleFilterChange}
                          InputProps={{
                            startAdornment: <Icon position="start">search</Icon>,
                          }}
                        />
                      </MDBox>

                      <MDBox width={{ xs: "100%", sm: "47%", md: "30%" }}>
                        <FormControl fullWidth>
                          <InputLabel>État</InputLabel>
                          <Select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            label="État"
                            sx={{ height: '44px' }}
                          >
                            <MenuItem value="tous">Tous</MenuItem>
                            <MenuItem value="Actif">Actif</MenuItem>
                            <MenuItem value="Inactif">Inactif</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>

                      <MDBox width={{ xs: "100%", sm: "47%", md: "30%" }}>
                        <FormControl fullWidth>
                          <InputLabel>Plan abonnement</InputLabel>
                          <Select
                            name="plans"
                            value={filters.plans}
                            onChange={handleFilterChange}
                            label="Plan abonnement"
                            sx={{ height: '44px' }}
                          >
                            <MenuItem value="tous">Tous</MenuItem>
                            <MenuItem value="Pack Écrit Standard">Pack Écrit Standard</MenuItem>
                            <MenuItem value="Pack Écrit Performance">Pack Écrit Performance</MenuItem>
                            <MenuItem value="Pack Écrit Pro">Pack Écrit Pro</MenuItem>
                          </Select>
                        </FormControl>
                      </MDBox>

                      <MDBox width={{ xs: "100%", sm: "47%", md: "30%" }}>
                        <MDInput
                          fullWidth
                          label="Date de début"
                          type="date"
                          name="dateFrom"
                          value={filters.dateFrom}
                          onChange={handleFilterChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </MDBox>

                      <MDBox width={{ xs: "100%", sm: "47%", md: "30%" }}>
                        <MDInput
                          fullWidth
                          label="Date de fin"
                          type="date"
                          name="dateTo"
                          value={filters.dateTo}
                          onChange={handleFilterChange}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </MDBox>
                    </MDBox>
                  )}

                  <TabPanel value={tabValue} index={0}>
                    <DataTable
                      table={{ columns, rows: writtenRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </TabPanel>
                  <TabPanel value={tabValue} index={1}>
                    <DataTable
                      table={{ columns, rows: oralRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  </TabPanel>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Dialog pour ajouter/modifier un sujet */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? "Modifier le sujet" : "Ajouter un nouveau sujet"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={6}>
              <MDInput
                margin="dense"
                label="Nom du sujet"
                type="text"
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                margin="dense"
                label="Combinaison"
                type="text"
                fullWidth
                name="combination"
                value={formData.combination}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                margin="dense"
                label="Date de création"
                type="date"
                fullWidth
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Plan abonnement</InputLabel>
                <Select
                  name="plans"
                  value={formData.plans}
                  onChange={handleInputChange}
                  label="Plan abonnement"
                  sx={{ height: '44px' }}
                >
                  <MenuItem value="Pack Écrit Standard">Pack Écrit Standard</MenuItem>
                  <MenuItem value="Pack Écrit Performance">Pack Écrit Performance</MenuItem>
                  <MenuItem value="Pack Écrit Pro">Pack Écrit Pro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>État</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="État"
                  sx={{ height: '44px' }}
                >
                  <MenuItem value="Actif">Actif</MenuItem>
                  <MenuItem value="Inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                margin="dense"
                label="Durée (minutes)"
                type="number"
                fullWidth
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="subtitle2" mb={1}>
                Description sujet
              </MDTypography>
              <ReactQuill
                theme="snow"
                style={{ height: "300px", marginBottom: "50px" }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['clean']
                  ]
                }}
                value={formData.blog}
                onChange={(content) => {
                  if (content !== formData.blog) {
                    setFormData({
                      ...formData,
                      blog: content
                    });
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="h6" mt={2} mb={1}>
                Tâches
              </MDTypography>
              <MDBox display="flex" justifyContent="flex-end" mb={2}>
                <MDButton 
                  variant="outlined" 
                  color="info" 
                  size="small"
                  onClick={() => {
                    const newTask = { 
                      id: formData.tasks.length + 1, 
                      title: "", 
                      structure: "", 
                      wordCount: tabValue === 0 ? 150 : 0, 
                      duration: tabValue === 1 ? 3 : 0 
                    };
                    setFormData({
                      ...formData,
                      tasks: [...formData.tasks, newTask]
                    });
                  }}
                >
                  <Icon>add</Icon>&nbsp;Ajouter une tâche
                </MDButton>
              </MDBox>
            </Grid>
            {formData.tasks.map((task, index) => (
              <Grid container item spacing={2} key={task.id}>
                <Grid item xs={12}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <MDTypography variant="subtitle2">
                      Tâche {index + 1}
                    </MDTypography>
                    {formData.tasks.length > 1 && (
                      <MDButton 
                        variant="text" 
                        color="error" 
                        size="small"
                        onClick={() => {
                          const updatedTasks = formData.tasks.filter((_, i) => i !== index);
                          setFormData({
                            ...formData,
                            tasks: updatedTasks
                          });
                        }}
                      >
                        <Icon>delete</Icon>&nbsp;Supprimer
                      </MDButton>
                    )}
                  </MDBox>
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={1}>
                    Titre de la tâche
                  </MDTypography>
                  <ReactQuill
                    key={`task-title-${task.id}`}
                    theme="snow"
                    style={{ height: "150px", marginBottom: "50px" }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['clean']
                      ]
                    }}
                    value={task.title}
                    onChange={(content) => handleTaskChange(index, "title", content)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={1}>
                    Structure à respecter
                  </MDTypography>
                  <ReactQuill
                    key={`task-structure-${task.id}`}
                    theme="snow"
                    style={{ height: "200px", marginBottom: "50px" }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['clean']
                      ]
                    }}
                    value={task.structure}
                    onChange={(content) => handleTaskChange(index, "structure", content)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={1}>
                    Instructions spécifiques
                  </MDTypography>
                  <ReactQuill
                    key={`task-instructions-${task.id}`}
                    theme="snow"
                    style={{ height: "150px", marginBottom: "50px" }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['clean']
                      ]
                    }}
                    value={task.instructions || ""}
                    onChange={(content) => handleTaskChange(index, "instructions", content)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="caption" color="text">
                    Documents de référence
                  </MDTypography>
                  {(task.documents || []).map((doc, docIndex) => (
                    <MDBox key={docIndex} display="flex" alignItems="center" mb={1}>
                      <MDInput
                        margin="dense"
                        label={`Document ${docIndex + 1}`}
                        type="text"
                        fullWidth
                        multiline
                        rows={2}
                        value={doc.content}
                        onChange={(e) => {
                          const updatedDocs = [...(task.documents || [])];
                          updatedDocs[docIndex] = { ...doc, content: e.target.value };
                          handleTaskChange(index, "documents", updatedDocs);
                        }}
                      />
                      <MDButton 
                        variant="text" 
                        color="error" 
                        size="small"
                        onClick={() => {
                          const updatedDocs = (task.documents || []).filter((_, i) => i !== docIndex);
                          handleTaskChange(index, "documents", updatedDocs);
                        }}
                      >
                        <Icon>delete</Icon>
                      </MDButton>
                    </MDBox>
                  ))}
                  <MDBox display="flex" justifyContent="flex-end" mt={1}>
                    <MDButton 
                      variant="outlined" 
                      color="info" 
                      size="small"
                      onClick={() => {
                        const newDoc = { id: (task.documents || []).length + 1, content: "" };
                        const updatedDocs = [...(task.documents || []), newDoc];
                        handleTaskChange(index, "documents", updatedDocs);
                      }}
                    >
                      <Icon>add</Icon>&nbsp;Ajouter un document
                    </MDButton>
                  </MDBox>
                </Grid>
                {tabValue === 0 ? ( // TCF Écrit
                  <>
                    <Grid item xs={12} sm={6}>
                      <MDInput
                        margin="dense"
                        label={`Nombre de mots minimum`}
                        type="number"
                        fullWidth
                        value={task.minWordCount || 0}
                        onChange={(e) => handleTaskChange(index, "minWordCount", parseInt(e.target.value, 10))}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput
                        margin="dense"
                        label={`Nombre de mots maximum`}
                        type="number"
                        fullWidth
                        value={task.wordCount}
                        onChange={(e) => handleTaskChange(index, "wordCount", parseInt(e.target.value, 10))}
                      />
                    </Grid>
                  </>
                ) : ( // TCF Oral
                  <Grid item xs={12} sm={6}>
                    <MDInput
                      margin="dense"
                      label={`Durée (minutes)`}
                      type="number"
                      fullWidth
                      value={task.duration}
                      onChange={(e) => handleTaskChange(index, "duration", parseInt(e.target.value, 10))}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <MDBox borderBottom={1} borderColor="divider" my={2} />
                </Grid>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <MDButton onClick={handleCloseDialog} color="secondary">
            Annuler
          </MDButton>
          <MDButton onClick={handleSaveSubject} color="info">
            {isEditing ? "Modifier" : "Ajouter"}
          </MDButton>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default TCFAdminSimulator;