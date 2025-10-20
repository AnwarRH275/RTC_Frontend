/**
=========================================================
* Simulateur TCF Canada React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

// Services
import { 
  getDashboardStats, 
  getUserExams, 
  getUserAttempts, 
  getUserInfo, 
  getAllUsers, 
  calculateDashboardData,
  getMonthlyChartData,
  getRecentActivity,
  getCompleteDashboardData
} from "services/dashboardService";

function Dashboard() {
  const navigate = useNavigate();
  const chartOralRef = useRef(null);
  const chartEcritRef = useRef(null);
  const chartPrioritesRef = useRef(null);
  const chartDonutRef = useRef(null);
  
  // Références pour stocker les instances des graphiques
  const chartOralInstance = useRef(null);
  const chartEcritInstance = useRef(null);
  const chartPrioritesInstance = useRef(null);

  // Données du barème NCLC
  const nclcBareme = [
    { nclc: '4-5', score: '4 - 6 pts', equivalence: 'A2', interpretation: 'Niveau faible ' },
    { nclc: '6', score: '7 - 9 pts', equivalence: 'B1', interpretation: 'Niveau intermédiaire ' },
    { nclc: '7', score: '10 - 11 pts', equivalence: 'B2 (seuil)', interpretation: 'Objectif atteint (seuil immigration) ' },
    { nclc: '8', score: '12 - 13 pts', equivalence: 'B2+ / début C1', interpretation: 'Haut niveau ' },
    { nclc: '9', score: '14 - 15 pts', equivalence: 'C1', interpretation: 'Haut niveau ' },
    { nclc: '10+', score: '16 - 20 pts', equivalence: 'C1+ / C2', interpretation: 'Niveau supérieur ' }
  ];

  const [dashboardData, setDashboardData] = useState({
    userInfo: null,
    stats: {},
    recentActivity: [],
    loading: true
  });

  // Variables pour les examens avec moyennes et scores moyens
  const [oralExamsWithAverages, setOralExamsWithAverages] = useState([]);
  const [writtenExamsWithAverages, setWrittenExamsWithAverages] = useState([]);
  const [scoreMoyenOral, setScoreMoyenOral] = useState(5);
  const [scoreMoyenEcrit, setScoreMoyenEcrit] = useState(5);
  const [oralPct, setOralPct] = useState(50);
  const [ecritPct, setEcritPct] = useState(50);
  
  // Fonction pour convertir un score sur 20 en niveau CECRL (A1, A2, B1, B2, C1, C2)
  const convertScoreToCECRL = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'N/A';
    
    if (numScore < 4) return 'A1';
    if (numScore < 7) return 'A2';
    if (numScore < 10) return 'B1';
    if (numScore < 14) return 'B2';
    if (numScore < 17) return 'C1';
    return 'C2';
  };
  
  // Composant de carte de statistique moderne
  const ModernStatCard = ({ title, value, subtitle, icon, color, trend, onClick, isClickable = false }) => (
    <Card 
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

        '&:hover': isClickable ? {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: `0 20px 40px ${color}20`,
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        } : {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 25px ${color}15`,
        }
      }}
      onClick={onClick}
    >
      <MDBox sx={{ p: { xs: 2, sm: 3 } }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={1}>
              <Icon 
                sx={{ 
                  fontSize: { xs: '2rem !important', sm: '2.4rem !important' }, 
                  color: color,
                  background: `${color}15`,
                  borderRadius: 2,
                }}
              >
                {icon}
              </Icon>
              {trend && (
                <Chip 
                  label={trend}
                  size="small"
                  sx={{
                    ml: 2,
                    background: trend.startsWith('+') ? '#4caf5015' : '#f4433615',
                    color: trend.startsWith('+') ? '#4caf50' : '#f44336',
                    fontWeight: 'bold'
                  }}
                />
              )}
            </MDBox>
            <MDTypography variant="h3" fontWeight="bold" color="dark" mb={0.5} sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>
              {value}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="medium" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {title}
            </MDTypography>
            {subtitle && (
              <MDTypography variant="caption" color="text" sx={{ opacity: 0.8, display: 'block', mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                {subtitle}
              </MDTypography>
            )}
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );

  // Composant d'accès rapide aux simulateurs
  const SimulatorQuickAccess = ({ title, description, icon, color, path, stats }) => (
    <Card 
      sx={{
        borderRadius: 4,
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-10px) scale(1.03)',
          boxShadow: `0 25px 50px ${color}40`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,

        }
      }}
      onClick={() => navigate(path)}
    >
      <MDBox sx={{ p: { xs: 3, sm: 4 } }}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Icon sx={{ fontSize: { xs: '2.4rem !important', sm: '3rem !important' }, opacity: 0.9 }}>{icon}</Icon>
          <MDButton 
            variant="contained" 
            color="white" 
            size="small"
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              borderRadius: 2,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.75, sm: 1 },
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.8) 0%, rgba(240, 248, 255, 0.9) 30%, rgba(219, 234, 254, 0.85) 70%, rgba(191, 219, 254, 0.8) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 0px 2px rgba(31, 38, 135, 0.37)',
              color: '#1a365d',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(191, 219, 254, 0.9) 0%, rgba(240, 248, 255, 1) 30%, rgba(219, 234, 254, 0.95) 70%, rgba(191, 219, 254, 0.9) 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 40px rgba(31, 38, 135, 0.5)'
              }
            }}
          >
            COMMENCER
          </MDButton>
        </MDBox>
        <MDTypography variant="h4" fontWeight="bold" mb={1} sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}>
          {title}
        </MDTypography>
        <MDTypography variant="body2" sx={{ opacity: 0.9, mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
          {description}
        </MDTypography>
        {stats && (
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="caption" sx={{ opacity: 0.8 }}>
                Progression
              </MDTypography>
              <MDTypography variant="caption" fontWeight="bold">
                {stats.progress}%
              </MDTypography>
            </MDBox>
            <LinearProgress 
              variant="determinate" 
              value={stats.progress} 
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'white',
                  borderRadius: 3,
                }
              }}
            />
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
  
  // Fonction pour obtenir les données des widgets selon le rôle
  const getWidgetData = () => {
    const { userInfo, stats } = dashboardData;
    const role = userInfo?.role;
    
    if (role === 'Client') {
      return {
        widget1: {
          color: "primary",
          icon: "quiz",
          title: "Examens Réalisés",
          count: stats.totalExams || 0,
          percentage: {
            color: "success",
            amount: `+${stats.weeklyExams || 0}`,
            label: "cette semaine",
          }
        },
        widget2: {
          color: "info",
          icon: "trending_up",
          title: "Niveau Moyen",
          count: stats.averageScore || 'Aucun',
          percentage: {
            color: "success",
            amount: `Meilleur: ${stats.bestScore || 'Aucun'}`,
            label: "niveau atteint",
          }
        },
        widget3: {
          color: "success",
          icon: "calendar_today",
          title: "Série d'Étude",
          count: `${stats.studyStreak || 0} jours`,
          percentage: {
            color: "success",
            amount: `${stats.monthlyProgress || 0}`,
            label: "examens ce mois",
          }
        },
        widget4: {
          color: "warning",
          icon: "account_balance_wallet",
          title: "Crédits Restants",
          count: stats.remainingCredits || 0,
          percentage: {
            color: "info",
            amount: `${stats.totalCredits || 0}`,
            label: "crédits totaux",
          }
        }
      };
    } else {
      return {
        widget1: {
          color: "dark",
          icon: "people",
          title: "Utilisateurs Totaux",
          count: stats.total_users || 0,
          percentage: {
            color: "success",
            amount: `${stats.active_users || 0}`,
            label: "utilisateurs actifs",
          }
        },
        widget2: {
          color: "info",
          icon: "assignment",
          title: "Examens Passés",
          count: stats.total_exams || 0,
          percentage: {
            color: "success",
            amount: `${stats.total_attempts || 0}`,
            label: "tentatives totales",
          }
        },
        widget3: {
          color: "success",
          icon: "monetization_on",
          title: "Revenus Mensuels",
          count: `${stats.monthly_revenue || '0'}€`,
          percentage: {
            color: "success",
            amount: "+12%",
            label: "ce mois-ci",
          }
        },
        widget4: {
          color: "primary",
          icon: "trending_up",
          title: "Croissance",
          count: "+15%",
          percentage: {
            color: "success",
            amount: "Stable",
            label: "tendance",
          }
        }
      };
    }
  };

  const widgetData = getWidgetData();





  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      const completeDashboardData = await getCompleteDashboardData();
      setDashboardData({
        loading: false,
        ...completeDashboardData
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Initialiser Chart.js après le chargement des données
  useEffect(() => {
    if (!dashboardData.loading && window.Chart) {
      initializeCharts();
    }
  }, [dashboardData.loading]);

  // Charger Chart.js dynamiquement
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
      if (!dashboardData.loading) {
        initializeCharts();
      }
    };
    document.head.appendChild(script);

    return () => {
      // Nettoyer les graphiques lors du démontage
      if (chartOralInstance.current) {
        chartOralInstance.current.destroy();
      }
      if (chartEcritInstance.current) {
        chartEcritInstance.current.destroy();
      }
      if (chartPrioritesInstance.current) {
        chartPrioritesInstance.current.destroy();
      }
      document.head.removeChild(script);
    };
  }, []);

  const initializeCharts = () => {
    if (!window.Chart) return;

    // Détruire les graphiques existants avant d'en créer de nouveaux
    if (chartOralInstance.current) {
      chartOralInstance.current.destroy();
      chartOralInstance.current = null;
    }
    if (chartEcritInstance.current) {
      chartEcritInstance.current.destroy();
      chartEcritInstance.current = null;
    }
    if (chartPrioritesInstance.current) {
      chartPrioritesInstance.current.destroy();
      chartPrioritesInstance.current = null;
    }

    const { userExams = [] } = dashboardData;
    
    // Données pour les graphiques basées sur les vrais examens
    const niveaux = ["A1", "A2", "B1", "B2", "C1", "C2"];
    
    // Filtrer les examens par type
    const oralExams = userExams.filter(exam => exam.type_exam === 'oral');
    const writtenExams = userExams.filter(exam => exam.type_exam === 'écrit');
    
    // Compter les niveaux pour chaque type d'examen
    // Chaque "exam" dans le tableau représente une tâche individuelle
    // Un vrai examen = 3 tâches consécutives
    const countLevels = (tasks) => {
      const counts = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
      
      // Traiter les tâches par groupes de 3 pour former des examens complets
      for (let i = 0; i < tasks.length; i += 3) {
        const examTasks = tasks.slice(i, i + 3); // Prendre 3 tâches consécutives
        
        // S'assurer qu'on a bien 3 tâches pour former un examen complet
        if (examTasks.length === 3) {
          // Convertir chaque score de tâche en valeur numérique
          const taskScores = examTasks.map(task => {
            if (!task.score) return 5; // Score par défaut si manquant
            
            const scoreStr = task.score.toString().toUpperCase();
            
            // Vérifier d'abord si c'est un score numérique
            const numericScore = parseInt(scoreStr);
            if (!isNaN(numericScore)) {
              return numericScore;
            }
            
            // Sinon, convertir le niveau textuel en valeur numérique
            if (scoreStr.includes('C2')) return 18; // C2 = 18 pts
            if (scoreStr.includes('C1')) return 15; // C1 = 15 pts  
            if (scoreStr.includes('B2')) return 12; // B2 = 12 pts
            if (scoreStr.includes('B1')) return 8;  // B1 = 8 pts
            if (scoreStr.includes('A2')) return 5;  // A2 = 5 pts
            if (scoreStr.includes('A1')) return 2;  // A1 = 2 pts
            return 5; // Par défaut A2 = 5 pts
          });
          
          // Calculer la moyenne des 3 tâches pour obtenir le niveau de l'examen
          const averageScore = taskScores.reduce((sum, score) => sum + score, 0) / taskScores.length;
          
          // Convertir la moyenne en niveau CECRL
          let examLevel;
          if (averageScore >= 16) examLevel = 'C2';
          else if (averageScore >= 14) examLevel = 'C1';
          else if (averageScore >= 12) examLevel = 'B2';
          else if (averageScore >= 10) examLevel = 'B2';
          else if (averageScore >= 7) examLevel = 'B1';
          else if (averageScore >= 4) examLevel = 'A2';
          else examLevel = 'A1';
          
          // Incrémenter le compteur pour ce niveau d'examen
          counts[examLevel]++;
        }
      }
      
      return counts;
    };

    // Fonction pour calculer la moyenne individuelle de chaque examen (3 tâches)
    const calculateIndividualExamAverage = (tasks, startIndex) => {
      // Prendre 3 tâches consécutives à partir de startIndex
      const examTasks = tasks.slice(startIndex, startIndex + 3);
      
      if (examTasks.length !== 3) {
        return null; // Pas assez de tâches pour former un examen complet
      }
      
      // Convertir chaque score de tâche en valeur numérique
      const taskScores = examTasks.map(task => {
        if (!task.score) return 5; // Score par défaut si manquant
        
        const scoreStr = task.score.toString().toUpperCase();
        
        // Vérifier d'abord si c'est un score numérique
        const numericScore = parseInt(scoreStr);
        if (!isNaN(numericScore)) {
          return numericScore;
        }
        
        // Sinon, convertir le niveau textuel en valeur numérique
        if (scoreStr.includes('C2')) return 18; // C2 = 18 pts
        if (scoreStr.includes('C1')) return 15; // C1 = 15 pts  
        if (scoreStr.includes('B2')) return 12; // B2 = 12 pts
        if (scoreStr.includes('B1')) return 8;  // B1 = 8 pts
        if (scoreStr.includes('A2')) return 5;  // A2 = 5 pts
        if (scoreStr.includes('A1')) return 2;  // A1 = 2 pts
        return 5; // Par défaut A2 = 5 pts
      });
      
      // Retourner la moyenne des 3 tâches de cet examen
      const average = taskScores.reduce((sum, score) => sum + score, 0) / taskScores.length;
      return Math.round(average * 10) / 10; // Arrondir à 1 décimale
    };

    // Calculer les moyennes individuelles pour chaque examen
    // Créer les examens avec moyennes individuelles
    const oralExamsWithAveragesData = [];
    for (let i = 0; i < oralExams.length; i += 3) {
      const examAverage = calculateIndividualExamAverage(oralExams, i);
      if (examAverage !== null) {
        oralExamsWithAveragesData.push({
          type_exam: 'oral',
          averageScore: examAverage
        });
      }
    }
    
    const writtenExamsWithAveragesData = [];
    for (let i = 0; i < writtenExams.length; i += 3) {
      const examAverage = calculateIndividualExamAverage(writtenExams, i);
      if (examAverage !== null) {
        writtenExamsWithAveragesData.push({
          type_exam: 'écrit',
          averageScore: examAverage
        });
      }
    }

    // Mettre à jour les états
    setOralExamsWithAverages(oralExamsWithAveragesData);
    setWrittenExamsWithAverages(writtenExamsWithAveragesData);

    const dataOral = countLevels(oralExams);
    const dataEcrit = countLevels(writtenExams);
    
    // Calculer les scores moyens globaux (moyenne des moyennes individuelles)
    const calculateAverageScore = (examsWithAverages) => {
      if (examsWithAverages.length === 0) return 5; // Score par défaut A2 (4-6 pts)
      
      // Utiliser directement les moyennes calculées pour chaque examen
      const averageScores = examsWithAverages.map(exam => exam.averageScore);
      const globalAverage = averageScores.reduce((sum, score) => sum + score, 0) / averageScores.length;
      
      return Math.round(globalAverage * 10) / 10; // Arrondir à 1 décimale
    };

    const scoreMoyenOralData = calculateAverageScore(oralExamsWithAveragesData);
    const scoreMoyenEcritData = calculateAverageScore(writtenExamsWithAveragesData);

    // Mettre à jour les scores moyens
      setScoreMoyenOral(scoreMoyenOralData);
      setScoreMoyenEcrit(scoreMoyenEcritData);

      // Calculer les pourcentages pour les priorités d'entraînement
      const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
      
      let ecritPctData = 50; // Par défaut 50/50
      let oralPctData = 50;
      
      if (scoreMoyenOralData > 0 && scoreMoyenEcritData > 0) {
        // Calculer la différence entre les moyennes
        const delta = scoreMoyenEcritData - scoreMoyenOralData;
        
        // Si l'écrit est plus faible, augmenter le pourcentage d'entraînement écrit
        // Si l'oral est plus faible, augmenter le pourcentage d'entraînement oral
        ecritPctData = clamp(Math.round(50 + (delta * -12.5)), 20, 80);
        oralPctData = 100 - ecritPctData;
      } else if (scoreMoyenEcritData > 0 && scoreMoyenOralData === 0) {
        // Seulement des examens écrits, recommander plus d'oral
        ecritPctData = 30;
        oralPctData = 70;
      } else if (scoreMoyenOralData > 0 && scoreMoyenEcritData === 0) {
        // Seulement des examens oraux, recommander plus d'écrit
        ecritPctData = 70;
        oralPctData = 30;
      }

      // Mettre à jour les pourcentages
      setEcritPct(ecritPctData);
      setOralPct(oralPctData);

    const toArray = (obj) => niveaux.map(n => obj[n] ?? 0);

    const blue = 'rgba(37, 99, 235, 0.9)';
    const green = 'rgba(22, 163, 74, 0.9)';

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} examen(s) au niveau ${ctx.label}`
          }
        }
      }
    };

    // Graphique Expression Orale
    if (chartOralRef.current) {
      const ctx = chartOralRef.current.getContext('2d');
      chartOralInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: niveaux,
          datasets: [{
            data: toArray(dataOral),
            backgroundColor: blue,
            borderColor: blue,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          ...baseOptions,
          plugins: {
          ...baseOptions.plugins,
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} examen${context.parsed.y > 1 ? 's' : ''} au niveau ${context.label}`
            }
          }
        }
        }
      });
    }

    // Graphique Expression Écrite
    if (chartEcritRef.current) {
      const ctx = chartEcritRef.current.getContext('2d');
      chartEcritInstance.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: niveaux,
          datasets: [{
            data: toArray(dataEcrit),
            backgroundColor: green,
            borderColor: green,
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          }]
        },
        options: {
          ...baseOptions,
          plugins: {
            ...baseOptions.plugins,
            tooltip: {
              callbacks: {
                label: (context) => `${context.parsed.y} examen${context.parsed.y > 1 ? 's' : ''} au niveau ${context.label}`
              }
            }
          }
        }
      });
    }

    // Donut Priorités
    if (chartPrioritesRef.current) {
      const ctx = chartPrioritesRef.current.getContext('2d');
      chartPrioritesInstance.current = new window.Chart(ctx, {
        type: 'doughnut',
        data: { 
          labels: ['Écrit', 'Oral'], 
          datasets: [{ 
            data: [ecritPctData, oralPctData], 
            backgroundColor: [green, blue], 
            hoverOffset: 6 
          }] 
        },
        options: { 
          responsive: true, 
          plugins: { legend: { position: 'bottom' } }, 
          cutout: '65%' 
        }
      });

      // Mettre à jour le message de priorités
      const prioritesMsg = document.getElementById('prioritesMsg');
      if (prioritesMsg) {
        prioritesMsg.innerHTML = `Conseil : consacrez <strong>${ecritPctData}%</strong> du temps à l'écrit et <strong>${oralPctData}%</strong> à l'oral cette semaine.`;
      }
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox sx={{ 
        py: { xs: 2, sm: 3, md: 4 }, 
        overflowX: 'hidden', 
        width: '100%',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}>
        {/* Header avec gradient comme dans le template */}
        <MDBox mb={6}>
          <Card sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)',
            color: 'white',
            borderRadius: 4,
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
          }}>
            <MDBox sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDBox>
                  <MDTypography
                    variant="h2"
                    fontWeight="bold"
                    mb={2}
                    sx={{ color: 'white', fontSize: { xs: '1.75rem', sm: '2.2rem', md: '2.6rem' }, lineHeight: { xs: 1.2, md: 1.3 } }}
                   style={{color:'#fff'}}
                  >
                    Bonjour {(() => {
                      try {
                        const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                        return userInfo.prenom || 'Candidat';
                      } catch (error) {
                        return 'Candidat';
                      }
                    })()} 👋
                  </MDTypography>
                  <MDTypography
                    variant="h5"
                    fontWeight="medium"
                    sx={{ opacity: 0.9, mb: 1, color: 'white', fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' } }}
                   style={{color:'#fff'}}
                  >
                    Prêt à booster ton score TCF Canada aujourd'hui ? 🎯
                  </MDTypography>
                   <MDTypography
                     variant="body1"
                     sx={{ opacity: 0.85, fontStyle: 'italic', color: 'white', fontSize: { xs: '0.9rem', sm: '1rem' }, lineHeight: { xs: 1.4, sm: 1.5 } }}
                    style={{color:'#fff'}}
                   >
                     Poursuis ton apprentissage pas à pas. Chaque effort te rapproche de ton objectif ! 💪
                   </MDTypography>
                </MDBox>
                
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>

        {/* Statistiques modernes */}
         <MDBox mb={6}> 
           <MDTypography 
             variant="h4" 
             fontWeight="bold" 
             color="dark" 
             mb={3}
             sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' } }}
           > 
             📊 Vos performances 
           </MDTypography> 
           <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}> 
             <Grid item xs={12} sm={6} lg={3}> 
               <ModernStatCard 
                 title="Examens Réalisés" 
                 value={dashboardData.loading ? "..." : (dashboardData.stats?.totalExams/3 || 0)} 
                 subtitle="Total depuis le début" 
                 icon="quiz" 
                 color="#4f46e5" 
                 trend={dashboardData.stats?.weeklyExams ? `+${dashboardData.stats.weeklyExams}` : null} 
               /> 
             </Grid> 
             <Grid item xs={12} sm={6} lg={3}> 
               <ModernStatCard 
                 title="Niveau Moyen" 
                 value={dashboardData.loading ? "..." : (dashboardData.stats?.averageScore || 'Aucun')} 
                 subtitle={`Meilleur niveau: ${dashboardData.stats?.bestScore || 'Aucun'}`} 
                 icon="trending_up" 
                 color="#10b981" 
                 trend={dashboardData.stats?.averageScore === 'C1' || dashboardData.stats?.averageScore === 'C2' ? '+Excellent' : dashboardData.stats?.averageScore === 'B2' || dashboardData.stats?.averageScore === 'B1' ? 'Bien' : 'À améliorer'} 
               /> 
             </Grid> 
             <Grid item xs={12} sm={6} lg={3}> 
               <ModernStatCard 
                 title="Série d'Étude" 
                 value={dashboardData.loading ? "..." : `${dashboardData.stats?.studyStreak || 0} jours`} 
                 subtitle="Jours consécutifs d'entraînement" 
                 icon="local_fire_department"
                 color="#f59e0b"
                 trend={dashboardData.stats?.studyStreak > 5 ? 'En feu! 🔥' : 'Continuez! 💪'}
               />
             </Grid>
             <Grid item xs={12} sm={6} lg={3}>
               <ModernStatCard
                 title="Crédits Restants"
                 value={dashboardData.loading ? "..." : (dashboardData.stats?.remainingCredits || 0)}
                 subtitle="Pour passer des examens"
                 icon="paid"
                 color="#6366f1"
                 trend={dashboardData.stats?.remainingCredits > 10 ? 'Suffisant' : 'Pensez à recharger'}
               />
             </Grid>
           </Grid>
         </MDBox>

        {/* Vue par compétence - Comme dans le template */}
        <MDBox mb={6}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 6 }}>
            {/* Expression Orale */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                <MDBox sx={{ p: { xs: 2, sm: 3 } }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <MDTypography variant="h5" fontWeight="bold" sx={{ color: '#3b82f6', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      🎤 Expression Orale
                    </MDTypography>
                    <Chip 
                      label={oralExamsWithAverages.length > 0 ? 
                        `Dernier : ${convertScoreToCECRL(oralExamsWithAverages[oralExamsWithAverages.length - 1].averageScore)} - ${(scoreMoyenOral)}/20` :
                        'Aucun examen'
                      }
                      size="small"
                      sx={{ 
                        background: '#dbeafe', 
                        color: '#3b82f6',
                        fontSize: '0.75rem'
                      }}
                    />
                  </MDBox>
                  <MDBox display="flex" alignItems="center" sx={{ gap: { xs: 2, sm: 3 } }} mb={3}>
                    <LinearProgress 
                      variant="determinate" 
                      value={oralPct} 
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#dbeafe',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#3b82f6',
                          borderRadius: 4,
                        }
                      }}
                    />
                    <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#3b82f6' }}>
                      {oralPct}%
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={4} sx={{ height: { xs: 160, sm: 200 } }}>
                    <canvas ref={chartOralRef} style={{ maxHeight: '200px' }}></canvas>
                  </MDBox>
                  <MDBox display="flex" sx={{ gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <MDButton 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        background: '#3b82f6',
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { background: '#2563eb', transform: 'scale(1.02)' }
                      }}
                      onClick={() => navigate('/simulateur-tcf-expression-orale')}
                    style={{color:'#fff'}}
                   >
                      S'entraîner à l'oral
                    </MDButton>
                    <MDButton 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Mes erreurs
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>

            {/* Expression Écrite */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
                <MDBox sx={{ p: { xs: 2, sm: 3 } }}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <MDTypography variant="h5" fontWeight="bold" sx={{ color: '#10b981', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      ✍️ Expression Écrite
                    </MDTypography>
                    <Chip 
                      label={writtenExamsWithAverages.length > 0 ? 
                        `Dernier : ${convertScoreToCECRL(writtenExamsWithAverages[writtenExamsWithAverages.length - 1].averageScore)} - ${scoreMoyenEcrit}/20)` :
                        'Aucun examen'
                      }
                      size="small"
                      sx={{ 
                        background: '#dcfce7', 
                        color: '#10b981',
                        fontSize: '0.75rem'
                      }}
                    />
                  </MDBox>
                  <MDBox display="flex" alignItems="center" sx={{ gap: { xs: 2, sm: 3 } }} mb={3}>
                    <LinearProgress 
                      variant="determinate" 
                      value={ecritPct} 
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#dcfce7',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10b981',
                          borderRadius: 4,
                        }
                      }}
                    />
                    <MDTypography variant="body2" fontWeight="bold" sx={{ color: '#10b981' }}>
                      {ecritPct}%
                    </MDTypography>
                  </MDBox>
                  <MDBox mb={4} sx={{ height: { xs: 160, sm: 200 } }}>
                    <canvas ref={chartEcritRef} style={{ maxHeight: '200px' }}></canvas>
                  </MDBox>
                  <MDBox display="flex" sx={{ gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <MDButton 
                      variant="contained" 
                      size="small"
                      sx={{ 
                        background: '#10b981',
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.2 },
                        width: { xs: '100%', sm: 'auto' },
                        '&:hover': { background: '#059669', transform: 'scale(1.02)' }
                      }}
                      onClick={() => navigate('/simulateur-tcf-expression-ecrite')}
                     style={{color:'#fff'}}
                    >
                      S'entraîner à l'écrit
                    </MDButton>
                    <MDButton 
                      variant="outlined" 
                      size="small"
                      sx={{ 
                        borderColor: '#e5e7eb',
                        color: '#6b7280',
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Mes erreurs
                    </MDButton>
                  </MDBox>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Barème NCLC - Nouveau tableau */}
        <MDBox mb={6}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <MDBox sx={{ p: { xs: 2, sm: 3 } }}>
              <MDTypography 
                variant="h5" 
                fontWeight="bold" 
                color="dark" 
                mb={3}
                sx={{ fontSize: { xs: '1.05rem', sm: '1.2rem' } }}
              >
                📊 Barème NCLC – Expression Orale & Écrite
              </MDTypography>
              <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e5e7eb', overflow: 'auto' }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed' }} aria-label="Barème NCLC">
                  <TableHead sx={{ display: "table-header-group" }}>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1.5, sm: 2 }, width: '15%' }}>
                        NCLC
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1.5, sm: 2 }, width: '25%' }}>
                        Score (Écrit/Oral)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1.5, sm: 2 }, width: '25%' }}>
                        Équivalence CECRL
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: '#374151', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: { xs: 1.5, sm: 2 }, width: '35%' }}>
                        Interprétation
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nclcBareme.map((row, index) => (
                      <TableRow 
                        key={index}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f3f4f6' },
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <TableCell sx={{ py: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: '600', color: '#1f2937' }}>
                          {row.nclc}
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: '#4b5563' }}>
                          {row.score}
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          <Chip 
                            label={row.equivalence}
                            size="small"
                            sx={{
                              backgroundColor: row.equivalence.includes('C2') ? '#8B5CF6' :
                                             row.equivalence.includes('C1') ? '#0080ff' :
                                             row.equivalence.includes('B2') ? '#34D399' :
                                             row.equivalence.includes('B1') ? '#FBBF24' :
                                             row.equivalence.includes('A2') ? '#F87171' : '#AAAAAA',
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: '#6b7280', fontStyle: 'italic' }}>
                          {row.interpretation}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </MDBox>
          </Card>
        </MDBox>

        {/* Priorités d'entraînement - Sans radar */}
        <MDBox mb={6}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}>
            <MDBox sx={{ p: { xs: 2, sm: 3 } }}>
              <MDTypography 
                variant="h5" 
                fontWeight="bold" 
                color="dark" 
                mb={3}
                sx={{ fontSize: { xs: '1.05rem', sm: '1.2rem' } }}
              >
                🎯 Vos priorités d'entraînement
              </MDTypography>
              <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
                <Grid item xs={12} md={8}>
                  <MDBox sx={{ height: { xs: 220, sm: 300 } }}>
                    <canvas ref={chartPrioritesRef} style={{ maxHeight: '300px' }}></canvas>
                  </MDBox>
                  <MDTypography 
                    id="prioritesMsg"
                    variant="body2" 
                    color="text" 
                    sx={{ mt: 2, textAlign: 'center', fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    Conseil : cette semaine, misez plutôt sur l’écrit (60%) et l’oral (40%).
                  </MDTypography>
                </Grid>
              </Grid>
            </MDBox>
          </Card>
        </MDBox>



        {/* Coaching - Comme dans le template */}
        <MDBox mb={6}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 15px 35px rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.4)' }
              }}>
                <MDBox sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    mb={1} 
                    sx={{ color: 'white', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Coach Écrit
                  </MDTypography>
                  <MDTypography 
                    variant="body2" 
                    sx={{ opacity: 0.9, mb: 3, color: 'white', fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    Entraînements guidés + corrections types
                  </MDTypography>
                  <MDButton 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      background: 'white',
                      color: '#10b981',
                      borderRadius: 3,
                      px: { xs: 2, sm: 3 },
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': { background: '#f9fafb', transform: 'translateY(-2px)' }
                    }}
                    onClick={() => navigate('/simulateur-tcf-expression-ecrite')}
                  >
                    Commencer
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                borderRadius: 4,
                boxShadow: '0 15px 35px rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4)' }
              }}>
                <MDBox sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                  <MDTypography 
                    variant="h5" 
                    fontWeight="bold" 
                    mb={1} 
                    sx={{ color: 'white', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Coach Oral
                  </MDTypography>
                  <MDTypography 
                    variant="body2" 
                    sx={{ opacity: 0.9, mb: 3, color: 'white', fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    Simulations + feedback personnalisé
                  </MDTypography>
                  <MDButton 
                    variant="contained" 
                    size="small"
                    sx={{ 
                      background: 'white',
                      color: '#3b82f6',
                      borderRadius: 3,
                      px: { xs: 2, sm: 3 },
                      width: { xs: '100%', sm: 'auto' },
                      '&:hover': { background: '#f9fafb', transform: 'translateY(-2px)' }
                    }}
                    onClick={() => navigate('/simulateur-tcf-expression-orale')}
                  >
                    Commencer
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>


 
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
