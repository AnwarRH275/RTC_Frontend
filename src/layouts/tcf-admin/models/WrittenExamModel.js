/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// @mui material components
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Services
import TCFAdminService from "services/tcfAdminService";

const WrittenExamModel = ({
  formData,
  setFormData
}) => {
  // Fonction pour gérer le changement des champs de tâche
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
  
  // Fonction pour ajouter une tâche écrite
  const addWrittenTask = () => {
    // Générer un ID temporaire unique pour les nouvelles tâches
    const newTempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTask = {
      // Tâche par défaut pour l'écrit
      id: newTempId,
      title: "", 
      structure: "", 
      instructions: "",
      minWordCount: 60, 
      wordCount: 150, 
      duration: 3,
      documents: []
    };
    
    setFormData({
      ...formData,
      tasks: [...formData.tasks, newTask]
    });
  };
  
  // Fonction pour ajouter un document de référence
  const addDocument = (taskIndex) => {
    const updatedTasks = [...formData.tasks];
    const newDocument = {
      id: Date.now(),
      content: ""
    };
    updatedTasks[taskIndex].documents = [...(updatedTasks[taskIndex].documents || []), newDocument];
    setFormData({ ...formData, tasks: updatedTasks });
  };

  // Fonction pour supprimer un document de référence
  const removeDocument = (taskIndex, documentIndex) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[taskIndex].documents = updatedTasks[taskIndex].documents.filter((_, i) => i !== documentIndex);
    setFormData({ ...formData, tasks: updatedTasks });
  };

  return (
    <>
      <Grid item xs={12}>
        <MDTypography variant="h6" mt={2} mb={1}>
          Tâches
        </MDTypography>
        <MDBox display="flex" justifyContent="flex-end" mb={2}>
          <MDButton 
            variant="outlined" 
            color="info" 
            size="small"
            onClick={addWrittenTask}
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
                      color: 'text.primary' 
                    }}
                  >
                    description
                  </Icon>
                  <MDTypography variant="h6" fontWeight="bold">
                    Tâche {index + 1}
                  </MDTypography>
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

              {/* Documents de référence */}
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
                    onClick={() => addDocument(index)}
                  >
                    <Icon>add</Icon>&nbsp;Ajouter un document
                  </MDButton>
                </MDBox>
              </Grid>

              {/* Champs spécifiques à l'écrit */}
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
              <Grid item xs={12}>
                <MDBox borderBottom={1} borderColor="divider" my={2} />
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      ))}
    </>
  );
};

export default WrittenExamModel;