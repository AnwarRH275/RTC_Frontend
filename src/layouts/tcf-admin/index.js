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
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

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
        duration: 3,
        taskType: "entretien", // Type de tâche pour l'oral: entretien, questions, expression
        questions: [], // Questions pour les tâches de type "questions"
        preparationTime: 0, // Temps de préparation en minutes
        evaluationCriteria: [], // Critères d'évaluation spécifiques
        exampleQuestions: [], // Questions d'exemple pour l'entretien
        roleplayScenario: "", // Scénario de jeu de rôle pour les questions
        debateTopics: [] // Sujets de débat pour l'expression spontanée
      },
    ],
  });

  // État pour gérer l'expansion des accordéons
  const [expandedAccordion, setExpandedAccordion] = useState(false);

  // Types de tâches orales
  const oralTaskTypes = [
    {
      id: "entretien",
      label: "Première Tâche - Entretien",
      icon: "chat",
      color: "primary",
      description: "Entretien avec l'examinateur, sans préparation",
      duration: "2-3 minutes"
    },
    {
      id: "questions",
      label: "Deuxième Tâche - Questions",
      icon: "help_outline",
      color: "info",
      description: "Poser des questions sur un sujet de la vie quotidienne",
      duration: "4-5 minutes (+ 2 min préparation)"
    },
    {
      id: "expression",
      label: "Troisième Tâche - Expression",
      icon: "record_voice_over",
      color: "success",
      description: "Expression spontanée sur un sujet proposé",
      duration: "4-5 minutes"
    }
  ];

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
        minWordCount: task.minWordCount !== null && task.minWordCount !== undefined ? task.minWordCount : (tabValue === 0 ? 60 : 0),
        wordCount: task.wordCount !== null && task.wordCount !== undefined ? task.wordCount : (tabValue === 0 ? 150 : 3),
        documents: task.documents || []
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

  // Fonction pour gérer le changement de type de tâche orale
  const handleOralTaskTypeChange = (index, taskType) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      taskType: taskType,
      // Réinitialiser les champs spécifiques selon le type
      questions: taskType === "questions" ? updatedTasks[index].questions || [] : [],
      exampleQuestions: taskType === "entretien" ? updatedTasks[index].exampleQuestions || [] : [],
      debateTopics: taskType === "expression" ? updatedTasks[index].debateTopics || [] : [],
      preparationTime: taskType === "questions" ? 2 : 0,
      duration: taskType === "entretien" ? 3 : taskType === "questions" ? 5 : 5
    };
    setFormData({
      ...formData,
      tasks: updatedTasks
    });
  };

  // Fonction pour ajouter une question d'exemple
  const addExampleQuestion = (taskIndex) => {
    const updatedTasks = [...formData.tasks];
    const newQuestion = {
      id: Date.now(),
      text: "",
      category: "personnel" // personnel, professionnel, culturel, etc.
    };
    updatedTasks[taskIndex].exampleQuestions = [...(updatedTasks[taskIndex].exampleQuestions || []), newQuestion];
    setFormData({ ...formData, tasks: updatedTasks });
  };

  // Fonction pour supprimer une question d'exemple
  const removeExampleQuestion = (taskIndex, questionIndex) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[taskIndex].exampleQuestions = updatedTasks[taskIndex].exampleQuestions.filter((_, i) => i !== questionIndex);
    setFormData({ ...formData, tasks: updatedTasks });
  };

  // Fonction pour ajouter un sujet de débat
  const addDebateTopic = (taskIndex) => {
    const updatedTasks = [...formData.tasks];
    const newTopic = {
      id: Date.now(),
      topic: "",
      context: "",
      difficulty: "moyen" // facile, moyen, difficile
    };
    updatedTasks[taskIndex].debateTopics = [...(updatedTasks[taskIndex].debateTopics || []), newTopic];
    setFormData({ ...formData, tasks: updatedTasks });
  };

  // Fonction pour supprimer un sujet de débat
  const removeDebateTopic = (taskIndex, topicIndex) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[taskIndex].debateTopics = updatedTasks[taskIndex].debateTopics.filter((_, i) => i !== topicIndex);
    setFormData({ ...formData, tasks: updatedTasks });
  };

  // Fonction pour gérer l'expansion des accordéons
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  };

const handleSaveSubject = async () => {
  // Validation basique
  // if (!formData.name || formData.name.trim() === "") {
  //   setAlertInfo({
  //     show: true,
  //     message: "Veuillez saisir un nom pour le sujet",
  //     color: "error",
  //   });
  //   setTimeout(() => setAlertInfo({ show: false, message: "", color: "info" }), 3000);
  //   return;
  // }

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
    console.log()
    const apiData = {
      ...formData,
      subject_type: 'Écrit', // Toujours définir comme 'Écrit'
      tasks: formData.tasks.map(task => ({
        title: task.title,
        structure: task.structure,
        instructions: task.instructions || "",
        min_word_count: task.minWordCount !== null && task.minWordCount !== undefined ? task.minWordCount : 0,
        max_word_count: task.wordCount !== null && task.wordCount !== undefined ? task.wordCount : 0,
        duration: task.duration || 0,
        documents: task.documents || []
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
    { Header: "Nombre de tâches", accessor: "taskCount", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  // Préparer les données pour le DataTable
  const truncateText = (text, wordLimit) => {
    if (!text) return "";
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

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
        <MDTypography variant="button" fontWeight="medium" dangerouslySetInnerHTML={{ __html: truncateText(subject.blog, 10) }} />
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
                Description du sujet
              </MDTypography>
              <ReactQuill
                theme="snow"
                style={{ height: "200px", marginBottom: "60px" }}
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
                placeholder="Il s'agit de rédiger un message, un courriel ou une annonce adressé à un ou plusieurs destinataires dans le but d'inviter, décrire, raconter, informer ou exprimer une demande."
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
                    // Générer un ID temporaire unique pour les nouvelles tâches
                    const existingIds = formData.tasks.map(t => t.id).filter(id => id);
                    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
                    const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    const newTask = { 
                      id: newTempId, // ID temporaire pour les nouvelles tâches
                      title: "", 
                      structure: "", 
                      instructions: "",
                      minWordCount: tabValue === 0 ? 60 : 0,
                      wordCount: tabValue === 0 ? 150 : 0, 
                      duration: tabValue === 1 ? 3 : 0,
                      documents: [],
                      taskType: tabValue === 1 ? "entretien" : "",
                      questions: [],
                      preparationTime: 0,
                      evaluationCriteria: [],
                      exampleQuestions: [],
                      roleplayScenario: "",
                      debateTopics: []
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
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
                    }}
                  >
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDBox display="flex" alignItems="center">
                        <Icon 
                          sx={{ 
                            fontSize: 28, 
                            mr: 1, 
                            color: tabValue === 1 ? 'primary.main' : 'text.primary' 
                          }}
                        >
                          {tabValue === 1 ? 'record_voice_over' : 'description'}
                        </Icon>
                        <MDTypography variant="h6" fontWeight="bold">
                          Tâche {index + 1}
                        </MDTypography>
                        {tabValue === 1 && task.taskType && (
                          <Chip 
                            label={oralTaskTypes.find(t => t.id === task.taskType)?.label || task.taskType}
                            color={oralTaskTypes.find(t => t.id === task.taskType)?.color || 'default'}
                            size="small"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </MDBox>
                      {formData.tasks.length > 1 && (
                        <Tooltip title="Supprimer cette tâche">
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
                        </Tooltip>
                      )}
                    </MDBox>

                    {/* Sélection du type de tâche pour l'oral */}
                    {tabValue === 1 && (
                      <MDBox mb={3}>
                        <MDTypography variant="subtitle2" mb={2} fontWeight="bold">
                          Type de tâche d'expression orale
                        </MDTypography>
                        <RadioGroup
                          value={task.taskType || "entretien"}
                          onChange={(e) => handleOralTaskTypeChange(index, e.target.value)}
                          row
                        >
                          {oralTaskTypes.map((type) => (
                            <FormControlLabel
                              key={type.id}
                              value={type.id}
                              control={<Radio color={type.color} />}
                              label={
                                <MDBox display="flex" alignItems="center">
                                  <Icon sx={{ mr: 1, color: `${type.color}.main` }}>
                                    {type.icon}
                                  </Icon>
                                  <MDBox>
                                    <MDTypography variant="button" fontWeight="medium">
                                      {type.label}
                                    </MDTypography>
                                    <MDTypography variant="caption" display="block" color="text.secondary">
                                      {type.description} • {type.duration}
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              }
                              sx={{ 
                                mr: 3, 
                                mb: 1,
                                border: task.taskType === type.id ? `2px solid` : '1px solid',
                                borderColor: task.taskType === type.id ? `${type.color}.main` : 'divider',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: task.taskType === type.id ? `${type.color}.50` : 'background.paper',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </RadioGroup>
                      </MDBox>
                    )}

                    <Divider sx={{ my: 2 }} />
                <Grid item xs={12}>
                  <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="primary">
                    📝 Titre de la tâche
                  </MDTypography>
                  <ReactQuill
                    key={`task-title-${task.id}`}
                    theme="snow"
                    style={{ height: "120px", marginBottom: "50px" }}
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
                    placeholder="Saisissez le titre de la tâche..."
                    value={task.title}
                    onChange={(content) => handleTaskChange(index, "title", content)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="info">
                      📋 Structure à respecter
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
                      Définissez la structure que le candidat doit suivre pour organiser sa réponse
                    </MDTypography>
                  </MDBox>
                  <ReactQuill
                    key={`task-structure-${task.id}`}
                    theme="snow"
                    style={{ height: "180px", marginBottom: "50px" }}
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
                    placeholder="Exemple: Introduction, développement avec 2 exemples, conclusion"
                    value={task.structure}
                    onChange={(content) => handleTaskChange(index, "structure", content)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <MDBox mb={2}>
                    <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="warning">
                      📌 Instructions spécifiques
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
                      Précisez les consignes détaillées et les attentes spécifiques pour cette tâche
                    </MDTypography>
                  </MDBox>
                  <ReactQuill
                    key={`task-instructions-${task.id}`}
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
                    placeholder="Vous avez participé à une formation professionnelle qui ne s'est pas déroulée comme prévu (retards, matériel défectueux, manque de suivi). Écrivez un courriel au responsable de l'organisme pour exprimer votre mécontentement et demander des explications ou un geste commercial."
                    value={task.instructions || ""}
                    onChange={(content) => handleTaskChange(index, "instructions", content)}
                  />
                </Grid>

                    {/* Sections spécialisées pour les tâches orales */}
                    {tabValue === 1 && (
                      <MDBox>
                        {/* Section pour l'entretien */}
                        {task.taskType === "entretien" && (
                          <Accordion 
                            expanded={expandedAccordion === `entretien-${index}`} 
                            onChange={handleAccordionChange(`entretien-${index}`)}
                            sx={{ mb: 2, borderRadius: 2 }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <MDBox display="flex" alignItems="center">
                                <Icon sx={{ mr: 1, color: 'primary.main' }}>chat</Icon>
                                <MDTypography variant="subtitle1" fontWeight="bold">
                                  Questions d'exemple pour l'entretien
                                </MDTypography>
                              </MDBox>
                            </AccordionSummary>
                            <AccordionDetails>
                              <MDBox>
                                <MDTypography variant="body2" color="text.secondary" mb={2}>
                                  Ajoutez des questions d'exemple que l'examinateur peut poser durant l'entretien.
                                </MDTypography>
                                {(task.exampleQuestions || []).map((question, qIndex) => (
                                  <MDBox key={qIndex} mb={2} p={2} sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}>
                                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <MDTypography variant="caption" fontWeight="bold">
                                        Question {qIndex + 1}
                                      </MDTypography>
                                      <MDButton 
                                        variant="text" 
                                        color="error" 
                                        size="small"
                                        onClick={() => removeExampleQuestion(index, qIndex)}
                                      >
                                        <Icon>delete</Icon>
                                      </MDButton>
                                    </MDBox>
                                    <MDInput
                                      fullWidth
                                      multiline
                                      rows={2}
                                      placeholder="Ex: Quel est votre film préféré ? Pourquoi ?"
                                      value={question.text}
                                      onChange={(e) => {
                                        const updatedTasks = [...formData.tasks];
                                        updatedTasks[index].exampleQuestions[qIndex].text = e.target.value;
                                        setFormData({ ...formData, tasks: updatedTasks });
                                      }}
                                    />
                                    <FormControl fullWidth sx={{ mt: 1 }}>
                                      <InputLabel size="small">Catégorie</InputLabel>
                                      <Select
                                        size="small"
                                        value={question.category || "personnel"}
                                        onChange={(e) => {
                                          const updatedTasks = [...formData.tasks];
                                          updatedTasks[index].exampleQuestions[qIndex].category = e.target.value;
                                          setFormData({ ...formData, tasks: updatedTasks });
                                        }}
                                        label="Catégorie"
                                      >
                                        <MenuItem value="personnel">Personnel</MenuItem>
                                        <MenuItem value="professionnel">Professionnel</MenuItem>
                                        <MenuItem value="culturel">Culturel</MenuItem>
                                        <MenuItem value="loisirs">Loisirs</MenuItem>
                                        <MenuItem value="projets">Projets d'avenir</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </MDBox>
                                ))}
                                <MDButton 
                                  variant="outlined" 
                                  color="primary" 
                                  size="small"
                                  onClick={() => addExampleQuestion(index)}
                                  startIcon={<Icon>add</Icon>}
                                >
                                  Ajouter une question d'exemple
                                </MDButton>
                              </MDBox>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* Section pour les questions */}
                        {task.taskType === "questions" && (
                          <Accordion 
                            expanded={expandedAccordion === `questions-${index}`} 
                            onChange={handleAccordionChange(`questions-${index}`)}
                            sx={{ mb: 2, borderRadius: 2 }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <MDBox display="flex" alignItems="center">
                                <Icon sx={{ mr: 1, color: 'info.main' }}>help_outline</Icon>
                                <MDTypography variant="subtitle1" fontWeight="bold">
                                  Scénario de jeu de rôle
                                </MDTypography>
                              </MDBox>
                            </AccordionSummary>
                            <AccordionDetails>
                              <MDBox>
                                <MDTypography variant="body2" color="text.secondary" mb={2}>
                                  Définissez le scénario dans lequel le candidat doit poser des questions.
                                </MDTypography>
                                <ReactQuill
                                  theme="snow"
                                  style={{ height: "200px", marginBottom: "50px" }}
                                  placeholder="Ex: Je dirige une association d'aide aux personnes en difficulté. Demandez-moi comment fonctionne cette association..."
                                  value={task.roleplayScenario || ""}
                                  onChange={(content) => handleTaskChange(index, "roleplayScenario", content)}
                                />
                                <MDBox mt={3}>
                                  <MDTypography variant="subtitle2" mb={1}>
                                    Temps de préparation
                                  </MDTypography>
                                  <MDInput
                                    type="number"
                                    value={task.preparationTime || 2}
                                    onChange={(e) => handleTaskChange(index, "preparationTime", parseInt(e.target.value))}
                                    inputProps={{ min: 0, max: 5 }}
                                    endAdornment="minutes"
                                  />
                                </MDBox>
                              </MDBox>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* Section pour l'expression spontanée */}
                        {task.taskType === "expression" && (
                          <Accordion 
                            expanded={expandedAccordion === `expression-${index}`} 
                            onChange={handleAccordionChange(`expression-${index}`)}
                            sx={{ mb: 2, borderRadius: 2 }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <MDBox display="flex" alignItems="center">
                                <Icon sx={{ mr: 1, color: 'success.main' }}>record_voice_over</Icon>
                                <MDTypography variant="subtitle1" fontWeight="bold">
                                  Sujets de débat et d'expression
                                </MDTypography>
                              </MDBox>
                            </AccordionSummary>
                            <AccordionDetails>
                              <MDBox>
                                <MDTypography variant="body2" color="text.secondary" mb={2}>
                                  Ajoutez des sujets sur lesquels le candidat doit s'exprimer spontanément.
                                </MDTypography>
                                {(task.debateTopics || []).map((topic, tIndex) => (
                                  <MDBox key={tIndex} mb={3} p={2} sx={{ backgroundColor: 'background.paper', borderRadius: 2 }}>
                                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <MDTypography variant="caption" fontWeight="bold">
                                        Sujet {tIndex + 1}
                                      </MDTypography>
                                      <MDButton 
                                        variant="text" 
                                        color="error" 
                                        size="small"
                                        onClick={() => removeDebateTopic(index, tIndex)}
                                      >
                                        <Icon>delete</Icon>
                                      </MDButton>
                                    </MDBox>
                                    <MDInput
                                      fullWidth
                                      multiline
                                      rows={2}
                                      placeholder="Ex: Faut-il à votre avis interdire la vente d'alcool aux mineurs ?"
                                      label="Question/Sujet de débat"
                                      value={topic.topic}
                                      onChange={(e) => {
                                        const updatedTasks = [...formData.tasks];
                                        updatedTasks[index].debateTopics[tIndex].topic = e.target.value;
                                        setFormData({ ...formData, tasks: updatedTasks });
                                      }}
                                      sx={{ mb: 2 }}
                                    />
                                    <MDInput
                                      fullWidth
                                      multiline
                                      rows={3}
                                      placeholder="Contexte ou éléments de réflexion pour guider le candidat..."
                                      label="Contexte (optionnel)"
                                      value={topic.context}
                                      onChange={(e) => {
                                        const updatedTasks = [...formData.tasks];
                                        updatedTasks[index].debateTopics[tIndex].context = e.target.value;
                                        setFormData({ ...formData, tasks: updatedTasks });
                                      }}
                                      sx={{ mb: 2 }}
                                    />
                                    <FormControl fullWidth>
                                      <InputLabel size="small">Niveau de difficulté</InputLabel>
                                      <Select
                                        size="small"
                                        value={topic.difficulty || "moyen"}
                                        onChange={(e) => {
                                          const updatedTasks = [...formData.tasks];
                                          updatedTasks[index].debateTopics[tIndex].difficulty = e.target.value;
                                          setFormData({ ...formData, tasks: updatedTasks });
                                        }}
                                        label="Niveau de difficulté"
                                      >
                                        <MenuItem value="facile">Facile</MenuItem>
                                        <MenuItem value="moyen">Moyen</MenuItem>
                                        <MenuItem value="difficile">Difficile</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </MDBox>
                                ))}
                                <MDButton 
                                  variant="outlined" 
                                  color="success" 
                                  size="small"
                                  onClick={() => addDebateTopic(index)}
                                  startIcon={<Icon>add</Icon>}
                                >
                                  Ajouter un sujet de débat
                                </MDButton>
                              </MDBox>
                            </AccordionDetails>
                          </Accordion>
                        )}

                        {/* Section commune pour les critères d'évaluation */}
                        <Accordion 
                          expanded={expandedAccordion === `criteria-${index}`} 
                          onChange={handleAccordionChange(`criteria-${index}`)}
                          sx={{ mb: 2, borderRadius: 2, backgroundColor: 'grey.50' }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <MDBox display="flex" alignItems="center">
                              <Icon sx={{ mr: 1, color: 'warning.main' }}>assessment</Icon>
                              <MDTypography variant="subtitle1" fontWeight="bold">
                                Critères d'évaluation
                              </MDTypography>
                            </MDBox>
                          </AccordionSummary>
                          <AccordionDetails>
                            <MDBox>
                              <MDTypography variant="body2" color="text.secondary" mb={2}>
                                Définissez les critères d'évaluation spécifiques pour cette tâche.
                              </MDTypography>
                              <ReactQuill
                                theme="snow"
                                style={{ height: "150px", marginBottom: "50px" }}
                                placeholder="Ex: Fluidité, prononciation, vocabulaire, grammaire, cohérence du discours..."
                                value={task.evaluationCriteria || ""}
                                onChange={(content) => handleTaskChange(index, "evaluationCriteria", content)}
                              />
                              <MDBox mt={3}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={6}>
                                    <MDTypography variant="subtitle2" mb={1}>
                                      Durée de la tâche
                                    </MDTypography>
                                    <MDInput
                                      type="number"
                                      value={task.duration || oralTaskTypes.find(t => t.id === task.taskType)?.duration || 4}
                                      onChange={(e) => handleTaskChange(index, "duration", parseInt(e.target.value))}
                                      inputProps={{ min: 1, max: 10 }}
                                      endAdornment="minutes"
                                      fullWidth
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <MDTypography variant="subtitle2" mb={1}>
                                      Points attribués
                                    </MDTypography>
                                    <MDInput
                                      type="number"
                                      value={task.points || 20}
                                      onChange={(e) => handleTaskChange(index, "points", parseInt(e.target.value))}
                                      inputProps={{ min: 1, max: 100 }}
                                      endAdornment="points"
                                      fullWidth
                                    />
                                  </Grid>
                                </Grid>
                              </MDBox>
                            </MDBox>
                          </AccordionDetails>
                        </Accordion>
                      </MDBox>
                    )}
                  </Paper>
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
                        value={task.minWordCount !== null && task.minWordCount !== undefined ? task.minWordCount : 0}
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