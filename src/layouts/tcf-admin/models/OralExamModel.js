/**
=========================================================
* Réussir TCF Canada - v2.0.0
* Composant OralExamModel refactorisé
=========================================================
*/

import { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// @mui material components
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Configuration des types de tâches orales
export const ORAL_TASK_TYPES = {
  ENTRETIEN: {
    value: 'entretien',
    label: 'Entretien'
  },
  EXPRESSION: {
    value: 'expression',
    label: ' Jeu de rôle'
  },
  QUESTIONS: {
    value: 'questions',
    label: 'Expression d\'un point de vue'
  }
};

// Configuration de l'éditeur ReactQuill

// Configuration de l'éditeur ReactQuill
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const OralExamModel = ({ formData, setFormData, oralTaskTypes }) => {
  const [expandedAccordion, setExpandedAccordion] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialiser les tâches si elles n'existent pas
  useEffect(() => {
    if (!formData.tasks || formData.tasks.length === 0) {
      // Utiliser oralTaskTypes s'il est défini, sinon utiliser ORAL_TASK_TYPES local
      const taskTypesToUse = oralTaskTypes && oralTaskTypes.length > 0 
        ? oralTaskTypes 
        : Object.values(ORAL_TASK_TYPES);
      
      const defaultTasks = taskTypesToUse.map((taskType, index) => ({
        id: `task-${index + 1}`,
        title: "",
        taskType: taskType.value || taskType.id, // Compatibilité avec les deux formats
        objective: "",
        trigger: "",
        evaluationCriteria: "",
        duration: taskType.defaultDuration || 10, // Utiliser la durée par défaut si disponible
        points: 20,
        preparationTime: taskType.defaultPreparationTime || 0, // Utiliser le temps de préparation par défaut si disponible
        roleplayScenario: ""
      }));
      
      setFormData(prev => ({
        ...prev,
        tasks: defaultTasks
      }));
    }
  }, [formData.tasks, setFormData, oralTaskTypes]);

  // Fonction pour gérer l'expansion des accordéons
  const handleAccordionChange = useCallback((panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : false);
  }, []);

  // Fonction pour mettre à jour une tâche
  const updateTask = useCallback((taskIndex, updates) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, index) => 
        index === taskIndex ? { ...task, ...updates } : task
      )
    }));
  }, [setFormData]);

  // Fonction pour gérer le changement de type de tâche
  const handleTaskTypeChange = useCallback((taskIndex, newTaskType) => {
    // Utiliser oralTaskTypes s'il est défini, sinon utiliser ORAL_TASK_TYPES local
    const taskTypesToUse = oralTaskTypes && oralTaskTypes.length > 0 
      ? oralTaskTypes 
      : Object.values(ORAL_TASK_TYPES);
    
    // Trouver la configuration du type de tâche
    const taskTypeConfig = taskTypesToUse.find(t => (t.value || t.id) === newTaskType);
    if (!taskTypeConfig) return;

    const updates = {
      taskType: newTaskType,
      duration: taskTypeConfig.defaultDuration || 5,
      preparationTime: taskTypeConfig.defaultPreparationTime || 0,
      roleplayScenario: ""
    };

    updateTask(taskIndex, updates);
  }, [updateTask, oralTaskTypes]);

  // Les fonctions pour gérer les questions d'exemple et les sujets de débat ont été supprimées
  // car les modèles correspondants ont été retirés du backend.

  // Fonction pour valider les données
  const validateTask = useCallback((task, index) => {
    const taskErrors = {};
    
    if (!task.title?.trim()) {
      taskErrors.title = "Le titre est requis";
    }
    
    if (!task.objective?.trim()) {
      taskErrors.objective = "L'objectif de la tâche est requis";
    }
    
    if (!task.trigger?.trim()) {
      taskErrors.trigger = "Le déclenchement de la tâche est requis";
    }
    
    // Les critères d'évaluation ne sont plus requis
    // if (!task.evaluationCriteria?.trim()) {
    //   taskErrors.evaluationCriteria = "Les critères d'évaluation sont requis";
    // }

    // Utiliser oralTaskTypes s'il est défini, sinon utiliser ORAL_TASK_TYPES local
    const taskTypesToUse = oralTaskTypes && oralTaskTypes.length > 0 
      ? oralTaskTypes 
      : Object.values(ORAL_TASK_TYPES);
    
    // Trouver la configuration du type de tâche
    const taskTypeConfig = taskTypesToUse.find(t => (t.value || t.id) === task.taskType);
    const taskTypeValue = taskTypeConfig?.value || taskTypeConfig?.id;
    
    // Le scénario de jeu de rôle n'est plus requis
    // if (taskTypeValue === 'questions' && !task.roleplayScenario?.trim()) {
    //   taskErrors.roleplayScenario = "Le scénario de jeu de rôle est requis";
    // }

    return taskErrors;
  }, [oralTaskTypes]);

  // Rendu du composant
  if (!formData.tasks || formData.tasks.length === 0) {
    return (
      <Grid item xs={12}>
        <Alert severity="info">
          Initialisation des tâches en cours...
        </Alert>
      </Grid>
    );
  }

  return (
    <>
      <Grid item xs={12}>
        <MDTypography variant="h6" mt={2} mb={1}>
          Tâches TCF Expression Orale (3 tâches fixes)
        </MDTypography>
        <MDBox mb={2}>
          <MDTypography variant="body2" color="text.secondary">
            Les 3 tâches de l'examen oral TCF Canada sont prédéfinies selon le format officiel.
          </MDTypography>
        </MDBox>
      </Grid>

      {formData.tasks.map((task, taskIndex) => {
        // Utiliser oralTaskTypes s'il est défini, sinon utiliser ORAL_TASK_TYPES local
        const taskTypesToUse = oralTaskTypes && oralTaskTypes.length > 0 
          ? oralTaskTypes 
          : Object.values(ORAL_TASK_TYPES);
        
        const taskTypeConfig = taskTypesToUse.find(t => (t.value || t.id) === task.taskType);
        const taskErrors = validateTask(task, taskIndex);

        return (
          <Grid container item spacing={2} key={task.id || taskIndex}>
            <Grid item xs={12}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  border: Object.keys(taskErrors).length > 0 ? '2px solid #f44336' : 'none'
                }}
              >
                {/* En-tête de la tâche */}
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <MDBox display="flex" alignItems="center">
                    <Icon sx={{ fontSize: 28, mr: 1, color: 'primary.main' }}>
                      record_voice_over
                    </Icon>
                    <MDTypography variant="h6" fontWeight="bold">
                      Tâche {taskIndex + 1}
                    </MDTypography>
                    {taskTypeConfig && (
                      <Chip 
                        label={taskTypeConfig.label}
                        color={taskTypeConfig.color}
                        size="small"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="caption" color="text.secondary">
                      Tâche {taskIndex + 1} sur 3 (fixe)
                    </MDTypography>
                  </MDBox>
                </MDBox>

                {/* Sélection du type de tâche */}
                <MDBox mb={3}>
                  <MDTypography variant="subtitle2" mb={2} fontWeight="bold">
                    Type de tâche d'expression orale
                  </MDTypography>
                  <RadioGroup
                    value={task.taskType || "entretien"}
                    onChange={(e) => handleTaskTypeChange(taskIndex, e.target.value)}
                    row
                  >
                    {(oralTaskTypes && oralTaskTypes.length > 0 ? oralTaskTypes : Object.values(ORAL_TASK_TYPES)).map((type) => (
                      <FormControlLabel
                        key={type.value || type.id}
                        value={type.value || type.id}
                        control={<Radio />}
                        label={
                          <MDBox display="flex" alignItems="center">
                            <Icon sx={{ mr: 1 }}>
                              {type.icon || "circle"}
                            </Icon>
                            <MDBox>
                              <MDTypography variant="button" fontWeight="medium">
                                {type.label}
                              </MDTypography>
                              <MDTypography variant="caption" display="block" color="text.secondary">
                                {type.description} • {type.duration || `${type.defaultDuration || 5} min`}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                        }
                        sx={{ 
                          mr: 3, 
                          mb: 1,
                          border: task.taskType === (type.value || type.id) ? `2px solid` : '1px solid',
                          borderColor: task.taskType === (type.value || type.id) ? `${type.color || "primary"}.main` : 'divider',
                          borderRadius: 2,
                          p: 2,
                          backgroundColor: task.taskType === (type.value || type.id) ? `${type.color || "primary"}.50` : 'background.paper',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </RadioGroup>
                </MDBox>

                <Divider sx={{ my: 2 }} />

                {/* Titre de la tâche */}
                <Grid item xs={12} mb={3}>
                  <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="primary">
                    📝 Titre de la tâche
                  </MDTypography>
                  {taskErrors.title && (
                    <Alert severity="error" sx={{ mb: 1 }}>{taskErrors.title}</Alert>
                  )}
                  <ReactQuill
                    theme="snow"
                    style={{ height: "120px", marginBottom: "50px" }}
                    modules={QUILL_MODULES}
                    placeholder="Saisissez le titre de la tâche..."
                    value={task.title || ""}
                    onChange={(content) => updateTask(taskIndex, { title: content })}
                  />
                </Grid>
                
                {/* Objectif de la tâche */}
                <Grid item xs={12} mb={3}>
                  <MDBox mb={2}>
                    <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="info">
                      🎯 Objectif de la tâche
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
                      Définissez l'objectif principal que le candidat doit atteindre dans cette tâche
                    </MDTypography>
                  </MDBox>
                  {taskErrors.objective && (
                    <Alert severity="error" sx={{ mb: 1 }}>{taskErrors.objective}</Alert>
                  )}
                  <ReactQuill
                    theme="snow"
                    style={{ height: "150px", marginBottom: "50px" }}
                    modules={QUILL_MODULES}
                    placeholder="Exemple: Permettre au candidat de démontrer sa capacité à parler de soi et de son environnement quotidien"
                    value={task.objective || ""}
                    onChange={(content) => updateTask(taskIndex, { objective: content })}
                  />
                </Grid>
                
                {/* Déclenchement de la tâche */}
                <Grid item xs={12} mb={3}>
                  <MDBox mb={2}>
                    <MDTypography variant="subtitle2" mb={1} fontWeight="bold" color="warning">
                      🚀 Déclenchement de la tâche
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary" display="block" mb={1}>
                      Précisez comment l'examinateur doit introduire et lancer cette tâche
                    </MDTypography>
                  </MDBox>
                  {taskErrors.trigger && (
                    <Alert severity="error" sx={{ mb: 1 }}>{taskErrors.trigger}</Alert>
                  )}
                  <ReactQuill
                    theme="snow"
                    style={{ height: "180px", marginBottom: "50px" }}
                    modules={QUILL_MODULES}
                    placeholder="Décrivez comment l'examinateur doit introduire cette tâche..."
                    value={task.trigger || ""}
                    onChange={(content) => updateTask(taskIndex, { trigger: content })}
                  />
                </Grid>

                {/* Critères d'évaluation */}
                <Accordion 
                  expanded={expandedAccordion === `evaluation-${taskIndex}`} 
                  onChange={handleAccordionChange(`evaluation-${taskIndex}`)}
                  sx={{ mb: 2, borderRadius: 2 }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <MDBox display="flex" alignItems="center">
                      <Icon sx={{ mr: 1, color: 'success.main' }}>assessment</Icon>
                      <MDTypography variant="subtitle1" fontWeight="bold">
                        Critères d'évaluation
                      </MDTypography>
                    </MDBox>
                  </AccordionSummary>
                  <AccordionDetails>
                    <MDBox>
                      <MDTypography variant="body2" color="text.secondary" mb={2}>
                        Définissez les critères d'évaluation pour cette tâche.
                      </MDTypography>
                      {/* Le message d'erreur pour les critères d'évaluation n'est plus nécessaire */}
                      <ReactQuill
                        theme="snow"
                        style={{ height: "150px", marginBottom: "50px" }}
                        modules={QUILL_MODULES}
                        placeholder="Critères d'évaluation..."
                        value={task.evaluationCriteria || ""}
                        onChange={(content) => updateTask(taskIndex, { evaluationCriteria: content })}
                      />
                      
                      <Grid container spacing={2} mt={2}>
                        <Grid item xs={6}>
                          <MDInput
                            fullWidth
                            type="number"
                            label="Durée (minutes)"
                            value={task.duration || 0}
                            onChange={(e) => updateTask(taskIndex, { duration: parseInt(e.target.value) || 0 })}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <MDInput
                            fullWidth
                            type="number"
                            label="Points"
                            value={task.points || 20}
                            onChange={(e) => updateTask(taskIndex, { points: parseInt(e.target.value) || 20 })}
                          />
                        </Grid>
                      </Grid>
                    </MDBox>
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
          </Grid>
        );
      })}
    </>
  );
};

export default OralExamModel;