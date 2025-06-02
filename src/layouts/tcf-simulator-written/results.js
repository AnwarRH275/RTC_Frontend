import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Fade from "@mui/material/Fade";
import Zoom from "@mui/material/Zoom";

import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { keyframes } from "@mui/system";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Services
import TCFAdminService from "services/tcfAdminService";
import authService from "services/authService";
import { Paper } from "@mui/material";

// Animation CSS pour le chargement
const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

function TCFResultsInterface() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  
  // États principaux
  const [subject, setSubject] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fonction pour récupérer l'ID utilisateur depuis le token JWT
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      // Décoder le token JWT pour récupérer l'ID utilisateur
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || 0;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return 0;
    }
  };

  // Fonction pour enregistrer les résultats via l'API
  const saveResultsToAPI = async (correctionResults, subjectData) => {
    try {
      setSaving(true);
      const userId = getUserIdFromToken();
      
      // Préparer les données pour chaque tâche en utilisant subjectData
      const savePromises = subjectData.tasks.map(async (task, index) => {
        const taskResponse = responses[index] || '';
        const taskCorrection = correctionResults.corrections_taches?.[index] || '';
        
        const payload = {
          id_user: userId,
          id_subject: parseInt(subjectId),
          id_task: task.id || index + 1,
          reponse_utilisateur: taskResponse,
          score: correctionResults.NoteExam || '',
          reponse_ia: taskCorrection,
          points_fort: correctionResults.pointsForts?.join(', ') || '',
          point_faible: correctionResults.pointsAmeliorer?.join(', ') || '',
          traduction_reponse_ia: null
        };
        
        return axios.post('http://127.0.0.1:5001/exam/exams/user', payload, {
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            ...authService.getAuthHeader().headers
          }
        });
      });
      
      await Promise.all(savePromises);
      console.log('Résultats enregistrés avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des résultats:', error);
    } finally {
      setSaving(false);
    }
  };

  // Chargement du sujet et envoi des réponses pour correction
  useEffect(() => {
    const fetchSubjectAndSubmit = async () => {
      try {
        // Récupérer le sujet
        const subjectData = await TCFAdminService.getSubjectById(subjectId);
        setSubject(subjectData);
        
        // Récupérer les réponses
        const storedResponses = localStorage.getItem(`tcf-responses-${subjectId}`);
        const parsedResponses = storedResponses ? JSON.parse(storedResponses) : {};
        setResponses(parsedResponses);
        
        // Préparer les données pour l'API
        const taskResponses =  Object.entries(parsedResponses)
        .map(([key, value], index) => `Reponse Tache ${index + 1} :\n${value}`)
        .join('\n\n');
        const taskStructures = subjectData.tasks.map(task => task.structure || '').join('\n\n');
        const taskInstructions = subjectData.tasks.map(task => task.instructions || '').join('\n\n');
        
        // Préparer les documents pour l'IA
        const taskDocuments = subjectData.tasks.map((task, index) => {
          if (task.documents && task.documents.length > 0) {
            const documentsText = task.documents.map((doc, docIndex) => 
              `Document ${docIndex + 1}: ${doc.content}`
            ).join('\n');
            return `Tache ${index + 1} - Documents de référence:\n${documentsText}`;
          }
          return `Tache ${index + 1} - Aucun document de référence`;
        }).join('\n\n');
        
        // Envoyer les données à l'API pour correction
        const payload = {
          chatInput: taskResponses,
          sessionId: `session-${Date.now()}`,
          Taches: subjectData.tasks.map((task, index) => `Tache ${index + 1}: ${task.title || ''}`).join('\n\n'),
          Structures: subjectData.tasks.map((task, index) => `Tache ${index + 1}: ${task.structure || ''}`).join('\n\n'),
          Instructions: subjectData.tasks.map((task, index) => `Tache ${index + 1}: ${task.instructions || ''}`).join('\n\n'),
          Documents: taskDocuments // Ajouter les documents à l'API
        };
        
        try {
          // Appel réel à l'API de correction
          const response = await axios.post(
            'http://localhost:5678/webhook/a8a2dc8f-6191-46c8-b5a0-256e3384b011',
            payload,
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          // Traiter la réponse de l'API
          if (response.data && response.data.output) {
            setResults(response.data.output);
            
            // Enregistrer les résultats via l'API d'enregistrement, en passant subjectData
            await saveResultsToAPI(response.data.output, subjectData);
          } else {
            throw new Error('Format de réponse invalide');
          }
          
          setLoading(false);
        } catch (apiError) {
          console.error('Erreur lors de l\'appel à l\'API de correction:', apiError);
          setError("Une erreur s'est produite lors de la correction. Veuillez réessayer.");
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Erreur lors de la correction:', error);
        setError("Une erreur s'est produite lors de la correction. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchSubjectAndSubmit();
  }, [subjectId]);

  // Affichage du chargement
  if (loading) {
    return (
      <MDBox 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, rgba(79, 204, 231, 1) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Fade in timeout={1000}>
          <Card 
            sx={{ 
              maxWidth: 600, 
              width: '100%',
              p: 4, 
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <MDBox mb={4} mt={1}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  animation: `${pulseAnimation} 2s ease-in-out infinite`,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                }}
              >
                <Icon sx={{ fontSize: 40, color: 'white' }}>auto_fix_high</Icon>
              </Box>
              
              <MDTypography variant="h3" fontWeight="bold" color="dark" mb={1}>
                Correction en cours
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={4}>
                Analyse vos réponses et prépare votre évaluation détaillée...
              </MDTypography>
              
              <MDBox 
                sx={{
                  height: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    border: '8px solid #f3f3f3',
                    borderTop: '8px solid #667eea',
                    borderRadius: '50%',
                    animation: `${spinAnimation} 1s linear infinite`
                  }}
                />
              </MDBox>
              
              <MDTypography variant="body2" color="text" fontStyle="italic">
                Cela peut prendre quelques instants...
              </MDTypography>
            </MDBox>
          </Card>
        </Fade>
      </MDBox>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <MDBox 
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, rgba(79, 204, 231, 1) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          pl:25
        }}
      >
        <Card 
          sx={{ 
            maxWidth: 600, 
            p: 4, 
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            background: 'rgba(255,255,255,0.95)'
          }}
        >
          <MDBox mb={2}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                backgroundColor: '#ef4444', 
                margin: '0 auto 16px'
              }}
            >
              <Icon sx={{ fontSize: 40, color: 'white' }}>error</Icon>
            </Avatar>
            <MDTypography variant="h4" fontWeight="bold" color="error" mb={1}>
              Erreur
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={3}>
              {error}
            </MDTypography>
            <MDButton 
              variant="contained" 
              color="info" 
              onClick={() => { navigate('/tcf-simulator/written'); window.location.reload(); }}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
              }}
            >
              Retour aux sujets
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    );
  }

  // Affichage des résultats
  return (
    <MDBox 
      sx={{

        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 0,
        overflow: 'auto'
      }}
    >
      <MDBox sx={{ width: '100%', p: 0, m: 0 }}>
        <Zoom in timeout={800}>
          <Card 
            sx={{ 
              borderRadius: 0,
              overflow: 'hidden',
              boxShadow: 'none',
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* En-tête */}
            <MDBox 
              p={4} 
              sx={{
                background: 'linear-gradient(135deg, rgba(79, 204, 231, 1) 0%, rgba(79, 204, 231, 1) 100%)',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <MDBox display="flex" alignItems="center" mb={{ xs: 2, md: 0 }}>
                <Avatar 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    backgroundColor: 'white',
                    color: '#667eea',
                    mr: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}
                >
                  <Icon sx={{ fontSize: 35 }}>task_alt</Icon>
                </Avatar>
                <MDBox>
                  <MDTypography variant="h3" fontWeight="bold" color="white" mb={1}>
                  Résultats de votre évaluation
                  </MDTypography>
                  <MDTypography variant="h6" color="white" opacity={0.9}>
                    {subject?.name || 'Examen TCF'}
                  </MDTypography>
                </MDBox>
              </MDBox>
              
              <Chip 
                label={ '  🏆​  ' + results?.NoteExam || "Niveau B2"}
               
                style={{ color: '#fff' }}
                sx={{ 
                  backgroundColor: 'white',
                  color: '#667eea',
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  p: 3,
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  '& .MuiChip-label': { px: 2, py: 1.5 }
                }}
              />
            </MDBox>
            
            {/* Contenu principal */}
            <MDBox p={2} sx={{ flex: 1, overflow: 'auto' }}>
              <Grid container spacing={2}>
                  {/* Corrections par tâche */}
                  <Grid item xs={12} lg={9}>
                    <MDBox mb={2}>
                    <MDTypography variant="h4" fontWeight="bold" mb={4} color="dark">
                      <Icon sx={{ mr: 2, verticalAlign: 'middle', color: '#667eea' }}>assignment_turned_in</Icon>
                      Corrections détaillées
                    </MDTypography>
                    
                    {results?.corrections_taches?.map((correction, index) => (
                      <Fade in timeout={500 + (index * 300)} key={index}>
                        <Card 
                          sx={{ 
                            mb: 4, 
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                            borderRadius: 3,
                            border: '1px solid rgba(102, 126, 234, 0.1)',
                            transition: 'all 0.3s ease',
                            minHeight: '400px',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <MDBox 
                            p={3} 
                            sx={{ 
                              background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
                              borderBottom: '1px solid rgba(102, 126, 234, 0.1)'
                            }}
                          >
                            <MDBox display="flex" alignItems="center">
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  backgroundColor: '#667eea',
                                  mr: 2
                                }}
                              >
                                <MDTypography variant="h6" color="white" fontWeight="bold">
                                  {index + 1}
                                </MDTypography>
                              </Avatar>
                              <MDTypography variant="h5" fontWeight="bold" color="dark">
                                Tâche {index + 1}
                              </MDTypography>
                            </MDBox>
                          </MDBox>
                          
                          <MDBox p={3}>
                            {/* Section avec deux colonnes: Votre réponse et Correction proposée */}
                            <Grid container spacing={3}>
                              {/* Documents de référence - Nouvelle section */}
                              {subject?.tasks[index]?.documents && subject.tasks[index].documents.length > 0 && (
                                <Grid item xs={12}>
                                  <MDBox 
                                    p={3} 
                                    mb={3}
                                    sx={{
                                      background: '#f0f7ff',
                                      borderRadius: 2,
                                      border: '1px solid #bfdbfe',
                                      overflow: 'auto'
                                    }}
                                  >
                                    <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                                      Documents de référence:
                                    </MDTypography>
                                    
                                    <Grid container spacing={2}>
                                      {subject.tasks[index].documents.map((document, docIndex) => (
                                        <Grid item xs={12} md={6} key={docIndex}>
                                          <Paper 
                                            elevation={1} 
                                            sx={{ 
                                              p: 2, 
                                              borderRadius: 2,
                                              border: '1px solid #e5e7eb',
                                              backgroundColor: '#ffffff'
                                            }}
                                          >
                                            <MDTypography variant="subtitle2" fontWeight="bold" mb={1}>
                                              Document {docIndex + 1}
                                            </MDTypography>
                                            <MDTypography variant="body2" component="div">
                                              <div dangerouslySetInnerHTML={{ __html: document.content }} />
                                            </MDTypography>
                                          </Paper>
                                        </Grid>
                                      ))}
                                    </Grid>
                                  </MDBox>
                                </Grid>
                              )}
                              
                              {/* Votre réponse */}
                              <Grid item xs={12} md={5}>
                                <MDBox 
                                  p={3} 
                                  sx={{
                                    background: '#f8f9fa',
                                    borderRadius: 2,
                                    border: '1px solid #e9ecef',
                                    height: '100%',
                                    minHeight: '250px',
                                    overflow: 'auto'
                                  }}
                                >
                                  <MDTypography variant="h6" fontWeight="bold" color="dark" mb={2}>
                                    Votre réponse:
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text" lineHeight={1.8}>
                                    {responses[index] || 'Aucune réponse fournie'}
                                  </MDTypography>
                                  <MDBox mt={2} display="flex" justifyContent="flex-end">
                                    <MDTypography variant="caption" color="text">
                                      {responses[index] ? responses[index].split(/\s+/).filter(word => word.length > 0).length : 0} mots
                                    </MDTypography>
                                  </MDBox>
                                </MDBox>
                              </Grid>
                              
                              {/* Correction proposée */}
                              <Grid item xs={12} md={7}>
                                <MDBox 
                                  p={3} 
                                  sx={{
                                    background: '#f0f9ff',
                                    borderRadius: 2,
                                    border: '1px solid #cfe2ff',
                                    height: '100%',
                                    minHeight: '250px',
                                    overflow: 'auto'
                                  }}
                                >
                                  <MDTypography variant="h6" fontWeight="bold" color="info" mb={2}>
                                    Correction proposée:
                                  </MDTypography>
                                  <MDTypography variant="body2" color="text" lineHeight={1.8}>
                                    {correction}
                                  </MDTypography>
                                </MDBox>
                              </Grid>
                            </Grid>
                          </MDBox>
                        </Card>
                      </Fade>
                    )) || (
                      <MDTypography variant="body1" color="text" textAlign="center" py={4}>
                        Aucune correction disponible pour le moment.
                      </MDTypography>
                    )}
                  </MDBox>
                </Grid>
                
                {/* Points forts et à améliorer */}
                <Grid item xs={12} lg={3}>
                  <MDBox mb={4}>
                    <MDTypography variant="h4" fontWeight="bold" mb={4} color="dark">
                      <Icon sx={{ mr: 2, verticalAlign: 'middle', color: '#10b981' }}>recommend</Icon>
                      Points forts
                    </MDTypography>
                    
                    <Card 
                      sx={{ 
                        p: 3, 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <List>
                        {results?.pointsForts?.map((point, index) => (
                          <Fade in timeout={800 + (index * 200)} key={index}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <Avatar 
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    backgroundColor: '#10b981'
                                  }}
                                >
                                  <Icon sx={{ fontSize: 20, color: 'white' }}>check</Icon>
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText 
                                primary={point}
                                primaryTypographyProps={{
                                  fontWeight: 500,
                                  color: '#065f46'
                                }}
                              />
                            </ListItem>
                          </Fade>
                        )) || (
                          <MDTypography variant="body2" color="text" textAlign="center">
                            Aucun point fort identifié.
                          </MDTypography>
                        )}
                      </List>
                    </Card>
                  </MDBox>
                  
                  <MDBox mb={4}>
                    <MDTypography variant="h4" fontWeight="bold" mb={4} color="dark">
                      <Icon sx={{ mr: 2, verticalAlign: 'middle', color: '#f59e0b' }}>trending_up</Icon>
                      Points à améliorer
                    </MDTypography>
                    
                    <Card 
                      sx={{ 
                        p: 3, 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                      }}
                    >
                      <List>
                        {results?.pointsAmeliorer?.map((point, index) => (
                          <Fade in timeout={1000 + (index * 200)} key={index}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemIcon>
                                <Avatar 
                                  sx={{ 
                                    width: 36, 
                                    height: 36, 
                                    backgroundColor: '#f59e0b'
                                  }}
                                >
                                  <Icon sx={{ fontSize: 20, color: 'white' }}>trending_up</Icon>
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText 
                                primary={point}
                                primaryTypographyProps={{
                                  fontWeight: 500,
                                  color: '#92400e'
                                }}
                              />
                            </ListItem>
                          </Fade>
                        )) || (
                          <MDTypography variant="body2" color="text" textAlign="center">
                            Aucun point d'amélioration identifié.
                          </MDTypography>
                        )}
                      </List>
                    </Card>
                  </MDBox>
                  
                  <MDBox textAlign="center" mt={6}>
                    {saving && (
                      <MDBox mb={3}>
                        <MDTypography variant="body2" color="info" mb={2}>
                          <Icon sx={{ mr: 1, verticalAlign: 'middle' }}>save</Icon>
                          Enregistrement des résultats en cours...
                        </MDTypography>
                        <LinearProgress 
                          variant="indeterminate" 
                          sx={{ 
                            height: 4, 
                            borderRadius: 2,
                            backgroundColor: '#e3f2fd',
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #667eea, #764ba2)',
                              borderRadius: 2
                            }
                          }}
                        />
                      </MDBox>
                    )}
                    <MDButton 
                      variant="contained" 
                      color="info" 
                      size="large"
                      onClick={() => { navigate('/simulateur-tcf-canada/expression-ecrits'); window.location.reload(); }}
                      disabled={saving}
                      sx={{ 
                        px: 6, 
                        py: 2,
                        borderRadius: 3,
                        background: saving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: saving ? 'none' : '0 8px 32px rgba(102, 126, 234, 0.4)',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: saving ? 'none' : 'translateY(-2px)',
                          boxShadow: saving ? 'none' : '0 12px 40px rgba(102, 126, 234, 0.5)'
                        }
                      }}
                    >
                      <Icon sx={{ mr: 2 }}>arrow_back</Icon>
                      Retour aux exams
                    </MDButton>
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </Zoom>
      </MDBox>
    </MDBox>
  );
}

export default TCFResultsInterface;