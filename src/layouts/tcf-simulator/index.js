/**
=========================================================
* Réussir TCF Canada - v1.0.0
=========================================================
*/

import { useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

function TCFSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  // Exemple de questions pour le simulateur
  const questions = [
    {
      id: 1,
      section: "Compréhension orale",
      question: "Écoutez l'audio et choisissez la bonne réponse: Où se passe la conversation?",
      options: [
        { id: "a", text: "Dans un restaurant" },
        { id: "b", text: "Dans une bibliothèque" },
        { id: "c", text: "Dans une gare" },
        { id: "d", text: "Dans un magasin" },
      ],
      correctAnswer: "c",
    },
    {
      id: 2,
      section: "Compréhension orale",
      question: "Que veut faire la personne qui parle?",
      options: [
        { id: "a", text: "Acheter un billet" },
        { id: "b", text: "Demander des informations" },
        { id: "c", text: "Se plaindre d'un service" },
        { id: "d", text: "Réserver une place" },
      ],
      correctAnswer: "a",
    },
    {
      id: 3,
      section: "Compréhension écrite",
      question: "Lisez le texte et répondez à la question: Quel est le sujet principal du texte?",
      options: [
        { id: "a", text: "La pollution en ville" },
        { id: "b", text: "Les transports en commun" },
        { id: "c", text: "Le réchauffement climatique" },
        { id: "d", text: "L'économie d'énergie" },
      ],
      correctAnswer: "b",
    },
  ];

  const handleNext = () => {
    if (activeStep === questions.length - 1) {
      // Calculer le score
      let correctCount = 0;
      Object.keys(answers).forEach(questionId => {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question && answers[questionId] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setAnswers({});
    setScore(null);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

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
              >
                <MDTypography variant="h4" color="white">
                  Simulateur de Test TCF Canada
                </MDTypography>
                <MDTypography variant="body2" color="white" opacity={0.8}>
                  Préparez-vous efficacement pour votre examen
                </MDTypography>
              </MDBox>
              <MDBox p={3}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {questions.map((question, index) => (
                    <Step key={question.id}>
                      <StepLabel>{question.section}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                
                {score !== null ? (
                  <MDBox textAlign="center" mt={4}>
                    <MDTypography variant="h4" gutterBottom>
                      Résultat du test
                    </MDTypography>
                    <MDTypography variant="h2" color={score >= 60 ? "success" : "error"} gutterBottom>
                      {score}%
                    </MDTypography>
                    <MDTypography variant="body1" gutterBottom>
                      {score >= 60 
                        ? "Félicitations! Vous avez réussi le test." 
                        : "Vous devez encore vous améliorer pour réussir le test."}
                    </MDTypography>
                    <MDButton variant="contained" color="info" onClick={handleReset} sx={{ mt: 2 }}>
                      Recommencer le test
                    </MDButton>
                  </MDBox>
                ) : (
                  <MDBox>
                    <MDBox mt={4} mb={2}>
                      <MDTypography variant="h5" gutterBottom>
                        Question {activeStep + 1}
                      </MDTypography>
                      <MDTypography variant="body1" gutterBottom>
                        {questions[activeStep].question}
                      </MDTypography>
                      
                      <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Choisissez votre réponse:</FormLabel>
                        <RadioGroup
                          value={answers[questions[activeStep].id] || ''}
                          onChange={(e) => handleAnswerChange(questions[activeStep].id, e.target.value)}
                        >
                          {questions[activeStep].options.map(option => (
                            <FormControlLabel 
                              key={option.id} 
                              value={option.id} 
                              control={<Radio />} 
                              label={option.text} 
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </MDBox>
                    
                    <MDBox display="flex" justifyContent="space-between" mt={4}>
                      <MDButton
                        variant="outlined"
                        color="info"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                      >
                        Précédent
                      </MDButton>
                      <MDButton
                        variant="contained"
                        color="info"
                        onClick={handleNext}
                        disabled={!answers[questions[activeStep].id]}
                      >
                        {activeStep === questions.length - 1 ? 'Terminer' : 'Suivant'}
                      </MDButton>
                    </MDBox>
                  </MDBox>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default TCFSimulator;