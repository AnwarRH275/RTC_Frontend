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


// Simulateur TCF Canada React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Simulateur TCF Canada React example components
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Simulateur TCF Canada React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import MixedChart from "examples/Charts/MixedChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data - Toutes les données sont maintenant dynamiques basées sur l'utilisateur connecté

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

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

  const [dashboardData, setDashboardData] = useState({
    userInfo: null,
    stats: {},
    recentActivity: [],
    loading: true
  });

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
      <MDBox p={3}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
          <MDBox>
            <MDBox display="flex" alignItems="center" mb={1}>
              <Icon 
                sx={{ 
                  fontSize: '2.5rem !important', 
                  color: color,
                  background: `${color}15`,
                  borderRadius: 2,
                  p: 1,

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
            <MDTypography variant="h3" fontWeight="bold" color="dark" mb={0.5}>
              {value}
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="medium">
              {title}
            </MDTypography>
            {subtitle && (
              <MDTypography variant="caption" color="text" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
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
      <MDBox p={4}>
        <MDBox display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Icon sx={{ fontSize: '3rem !important', opacity: 0.9 }}>{icon}</Icon>
          <MDButton 
            variant="contained" 
            color="white" 
            size="small"
            sx={{ 
              minWidth: 'auto',
              borderRadius: 2,
              px: 2,
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
        <MDTypography variant="h4" fontWeight="bold" mb={1}>
          {title}
        </MDTypography>
        <MDTypography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
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

  // Charger les données du dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      
      // Utiliser la nouvelle fonction qui intègre les vraies données d'examens
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

  // Fonction pour générer les données du graphique des examens basées sur les vraies données
  const getExamChartData = () => {
    const { stats, userInfo, userExams } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Examens",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    // Utiliser les données réelles d'examens pour générer le graphique
    const role = userInfo?.role;
    if (role === 'Client') {
      // Générer les données mensuelles basées sur les vrais examens
      const monthlyData = generateMonthlyExamData(userExams);
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Mes Examens",
          data: monthlyData
        }
      };
    } else {
      const baseValue = stats.totalExams || 0;
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Examens Totaux",
          data: [
            Math.max(0, Math.floor(baseValue * 0.6)),
            Math.max(0, Math.floor(baseValue * 0.7)),
            Math.max(0, Math.floor(baseValue * 0.8)),
            Math.max(0, Math.floor(baseValue * 0.9)),
            baseValue,
            baseValue + Math.floor(baseValue * 0.1)
          ]
        }
      };
    }
  };

  // Fonction pour générer les données mensuelles d'examens
  const generateMonthlyExamData = (exams) => {
    if (!exams || exams.length === 0) {
      return [0, 0, 0, 0, 0, 0];
    }

    const currentYear = new Date().getFullYear();
    const monthlyCount = new Array(6).fill(0);
    const currentMonth = new Date().getMonth();
    
    exams.forEach(exam => {
      const examDate = new Date(exam.date_passage || exam.created_at);
      if (examDate.getFullYear() === currentYear) {
        const monthIndex = examDate.getMonth();
        // Mapper les mois aux 6 derniers mois
        const relativeMonth = monthIndex - (currentMonth - 5);
        if (relativeMonth >= 0 && relativeMonth < 6) {
          monthlyCount[relativeMonth]++;
        }
      }
    });
    
    return monthlyCount;
  };

  // Fonction pour générer les données du graphique des scores basées sur les vraies données
  const getScoreChartData = () => {
    const { stats, userInfo, userExams } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Scores",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    const role = userInfo?.role;
    if (role === 'Client') {
      // Générer les données de scores mensuelles basées sur les vrais examens
      const monthlyScores = generateMonthlyScoreData(userExams);
      
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Niveau Moyen (sur 100)",
          data: monthlyScores
        }
      };
    } else {
      // Pour les admins, afficher une progression générale
      return {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun"],
        datasets: {
          label: "Performance Générale",
          data: [65, 68, 70, 72, 75, 78]
        }
      };
    }
  };

  // Fonction pour générer les données de scores mensuelles
  const generateMonthlyScoreData = (exams) => {
    if (!exams || exams.length === 0) {
      return [0, 0, 0, 0, 0, 0];
    }

    const currentYear = new Date().getFullYear();
    const monthlyScores = new Array(6).fill([]);
    const currentMonth = new Date().getMonth();
    
    // Initialiser les tableaux pour chaque mois
    for (let i = 0; i < 6; i++) {
      monthlyScores[i] = [];
    }
    
    exams.forEach(exam => {
      const examDate = new Date(exam.date_passage || exam.created_at);
      const numericScore = convertCECRToNumeric(exam.score);
      
      if (examDate.getFullYear() === currentYear && numericScore > 0) {
        const monthIndex = examDate.getMonth();
        const relativeMonth = monthIndex - (currentMonth - 5);
        if (relativeMonth >= 0 && relativeMonth < 6) {
          monthlyScores[relativeMonth].push(numericScore);
        }
      }
    });
    
    // Calculer la moyenne pour chaque mois
    return monthlyScores.map(scores => {
      if (scores.length === 0) return 0;
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return Math.round(average); // Arrondir à l'entier le plus proche
    });
  };

  // Fonction pour convertir les niveaux CECR en valeurs numériques (pour les graphiques)
  const convertCECRToNumeric = (score) => {
    if (!score) return 0;
    
    const scoreUpper = score.toString().toUpperCase();
    
    // Gestion des niveaux CECR
    if (scoreUpper.includes('C2')) return 95;
    if (scoreUpper.includes('C1')) return 85;
    if (scoreUpper.includes('B2')) return 75;
    if (scoreUpper.includes('B1')) return 65;
    if (scoreUpper.includes('A2')) return 55;
    if (scoreUpper.includes('A1')) return 45;
    
    // Gestion des niveaux numériques (1-6)
    if (scoreUpper.includes('6')) return 95;
    if (scoreUpper.includes('5')) return 85;
    if (scoreUpper.includes('4')) return 75;
    if (scoreUpper.includes('3')) return 65;
    if (scoreUpper.includes('2')) return 55;
    if (scoreUpper.includes('1')) return 45;
    
    // Gestion des niveaux mixtes
    if (scoreUpper.includes('B1+') || scoreUpper.includes('B1/B2')) return 70;
    if (scoreUpper.includes('A2-B1') || scoreUpper.includes('A1-A2')) return 50;
    
    return 50; // Score par défaut
  };

  // Fonction pour compter les niveaux CECR avec includes()
  const countLevelsByIncludes = (exams, level) => {
    if (!exams || exams.length === 0) return 0;
    
    return exams.filter(exam => {
      if (!exam.score) return false;
      const scoreStr = exam.score.toString().toUpperCase();
      return scoreStr.includes(level);
    }).length;
  };

  // Fonction pour générer les données du graphique en barres d'expression orale
  const getOralExpressionBarChartData = () => {
    const { stats, userInfo, userExams } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Expression Orale",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    const role = userInfo?.role;
    if (role === 'Client') {
      // Filtrer les examens d'expression orale (type_exam = 'oral')
      const oralExams = userExams?.filter(exam => 
        exam.type_exam === 'oral'
      ) || [];
      
      // Compter les niveaux avec includes()
      const levelCounts = [
        countLevelsByIncludes(oralExams, 'A1'),
        countLevelsByIncludes(oralExams, 'A2'),
        countLevelsByIncludes(oralExams, 'B1'),
        countLevelsByIncludes(oralExams, 'B2'),
        countLevelsByIncludes(oralExams, 'C1'),
        countLevelsByIncludes(oralExams, 'C2')
      ];
      
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Nombre d'examens par niveau",
          data: levelCounts
        }
      };
    } else {
      // Pour les admins, calculer sur tous les examens oraux
      const oralExams = userExams?.filter(exam => exam.type_exam === 'oral') || [];
      
      const levelCounts = [
        countLevelsByIncludes(oralExams, 'A1'),
        countLevelsByIncludes(oralExams, 'A2'),
        countLevelsByIncludes(oralExams, 'B1'),
        countLevelsByIncludes(oralExams, 'B2'),
        countLevelsByIncludes(oralExams, 'C1'),
        countLevelsByIncludes(oralExams, 'C2')
      ];
      
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Distribution des niveaux - Oral",
          data: levelCounts
        }
      };
    }
  };





  // Fonction pour générer les données du graphique en barres d'expression écrite
  const getWrittenExpressionBarChartData = () => {
    const { stats, userInfo, userExams } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Expression Écrite",
          data: [0, 0, 0, 0, 0, 0]
        }
      };
    }
    
    const role = userInfo?.role;
    if (role === 'Client') {
      // Filtrer les examens d'expression écrite (type_exam = 'écrit')
      const writtenExams = userExams?.filter(exam => 
        exam.type_exam === 'écrit'
      ) || [];
      
      // Compter les niveaux avec includes()
      const levelCounts = [
        countLevelsByIncludes(writtenExams, 'A1'),
        countLevelsByIncludes(writtenExams, 'A2'),
        countLevelsByIncludes(writtenExams, 'B1'),
        countLevelsByIncludes(writtenExams, 'B2'),
        countLevelsByIncludes(writtenExams, 'C1'),
        countLevelsByIncludes(writtenExams, 'C2')
      ];
      
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Nombre d'examens par niveau",
          data: levelCounts
        }
      };
    } else {
      // Pour les admins, calculer sur tous les examens écrits
      const writtenExams = userExams?.filter(exam => exam.type_exam === 'écrit') || [];
      
      const levelCounts = [
        countLevelsByIncludes(writtenExams, 'A1'),
        countLevelsByIncludes(writtenExams, 'A2'),
        countLevelsByIncludes(writtenExams, 'B1'),
        countLevelsByIncludes(writtenExams, 'B2'),
        countLevelsByIncludes(writtenExams, 'C1'),
        countLevelsByIncludes(writtenExams, 'C2')
      ];
      
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: {
          label: "Distribution des niveaux - Écrit",
          data: levelCounts
        }
      };
    }
  };

  // Fonction pour générer les données du graphique combiné (Oral + Écrit)
  const getCombinedExpressionBarChartData = () => {
    const { stats, userInfo, userExams } = dashboardData;
    
    if (dashboardData.loading || !stats) {
      return {
        labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
        datasets: [
          {
            label: "Expression Orale",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: '#4f46e5',
            borderColor: '#4f46e5',
            borderWidth: 1
          },
          {
            label: "Expression Écrite",
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: '#10b981',
            borderColor: '#10b981',
            borderWidth: 1
          }
        ]
      };
    }
    
    const role = userInfo?.role;
    
    // Filtrer les examens par type
    const oralExams = userExams?.filter(exam => exam.type_exam === 'oral') || [];
    const writtenExams = userExams?.filter(exam => exam.type_exam === 'écrit') || [];
    
    // Compter les niveaux pour chaque type d'examen
    const oralLevelCounts = [
      countLevelsByIncludes(oralExams, 'A1'),
      countLevelsByIncludes(oralExams, 'A2'),
      countLevelsByIncludes(oralExams, 'B1'),
      countLevelsByIncludes(oralExams, 'B2'),
      countLevelsByIncludes(oralExams, 'C1'),
      countLevelsByIncludes(oralExams, 'C2')
    ];
    
    const writtenLevelCounts = [
      countLevelsByIncludes(writtenExams, 'A1'),
      countLevelsByIncludes(writtenExams, 'A2'),
      countLevelsByIncludes(writtenExams, 'B1'),
      countLevelsByIncludes(writtenExams, 'B2'),
      countLevelsByIncludes(writtenExams, 'C1'),
      countLevelsByIncludes(writtenExams, 'C2')
    ];
    
    return {
      labels: ["A1", "A2", "B1", "B2", "C1", "C2"],
      datasets: [
        {
          label: "Expression Orale",
          data: oralLevelCounts,
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: '#4f46e5',
          borderWidth: 2
        },
        {
          label: "Expression Écrite",
          data: writtenLevelCounts,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 2
        }
      ]
    };
  };



  // Fonction pour générer les données de la timeline
  const getTimelineData = () => {
    if (dashboardData.loading || !dashboardData.recentActivity) {
      return [
        {
          color: "info",
          icon: "notifications",
          title: "Chargement...",
          dateTime: "",
        }
      ];
    }

    if (dashboardData.recentActivity.length === 0) {
      return [
        {
          color: "secondary",
          icon: "info",
          title: "Aucune activité récente",
          dateTime: "Commencez votre premier examen",
        }
      ];
    }

    return dashboardData.recentActivity.map((activity, index) => {
      const date = new Date(activity.date);
      const timeAgo = getTimeAgo(date);
      
      return {
        color: index === 0 ? "success" : "info",
        icon: activity.type === 'exam' ? "quiz" : "assignment",
        title: activity.title,
        dateTime: timeAgo,
        description: activity.description
      };
    });
  };

  // Fonction utilitaire pour calculer le temps écoulé
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `il y a ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours}h`;
    } else {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={4} sx={{ overflowX: 'hidden', width: '100%' }}>
        {/* Section d'accueil motivante */}
        <MDBox mb={6}>
          <MDBox textAlign="center" mb={4}>
            <MDTypography variant="h2" fontWeight="bold" color="dark" mb={2}>
              Bonjour {(() => {
                try {
                  const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
                  return userInfo.prenom || 'Candidat';
                } catch (error) {
                  return 'Candidat';
                }
              })()} ! 👋
            </MDTypography>
            <MDTypography variant="h5" color="text" fontWeight="regular">
              Prêt à améliorer votre score TCF Canada aujourd'hui ?
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Accès rapides aux coachs */}
        <MDBox mb={6}>
          <MDTypography variant="h4" fontWeight="bold" color="dark" mb={3}>
            🚀 Commencez votre entraînement
          </MDTypography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <SimulatorQuickAccess
                title="Coach Expression Ecrits"
                description="Entraînez-vous aux épreuves de compréhension écrite et expression écrite"
                icon="edit_note"
                color="linear-gradient(135deg, rgba(191, 219, 254, 0.8) 0%, rgba(240, 248, 255, 0.9) 30%, rgba(219, 234, 254, 0.85) 70%, rgba(191, 219, 254, 0.8) 100%)"
                path="/simulateur-tcf-canada/expression-ecrits"
                stats={{
                  progress: Math.min(100, Math.round((dashboardData.stats?.totalExams || 0) / (dashboardData.stats?.totalCredits || 1) * 100))
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SimulatorQuickAccess
                title="Coach Expression Oral"
                description="Perfectionnez votre expression orale avec des exercices interactifs"
                icon="record_voice_over"
                color="linear-gradient(135deg, rgba(191, 219, 254, 0.8) 0%, rgba(240, 248, 255, 0.9) 30%, rgba(219, 234, 254, 0.85) 70%, rgba(191, 219, 254, 0.8) 100%)"
                path="/tcf-simulator/oral"
                stats={{
                  progress: Math.min(100, Math.round((dashboardData.stats?.averageScore || 0) / 20 * 100))
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        {/* Statistiques modernes */}
        <MDBox mb={6}>
          <MDTypography variant="h4" fontWeight="bold" color="dark" mb={3}>
            📊 Vos performances
          </MDTypography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard
                title="Examens Réalisés"
                value={dashboardData.loading ? "..." : (dashboardData.stats?.totalExams || 0)}
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
                trend={dashboardData.stats?.studyStreak > 7 ? '+Excellent' : dashboardData.stats?.studyStreak > 3 ? 'Bien' : null}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <ModernStatCard
                title="Crédits Restants"
                value={dashboardData.loading ? "..." : (dashboardData.stats?.remainingCredits || 0)}
                subtitle={`Total: ${dashboardData.stats?.totalCredits || 0} crédits`}
                icon="account_balance_wallet"
                color="#8b5cf6"
                trend={dashboardData.stats?.remainingCredits > 10 ? 'Suffisant' : dashboardData.stats?.remainingCredits > 5 ? 'Moyen' : 'Faible'}
              />
            </Grid>
          </Grid>
        </MDBox>




        {/* Graphiques Expression Orale et Écrite en Barres */}
        <MDBox mb={6}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4f46e515 0%, #4f46e505 100%)',
                border: '1px solid #4f46e520',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px #4f46e520'
                }
              }}>
                <MDBox p={3}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ color: '#4f46e5', fontSize: '1.5rem', mr: 1 }}>record_voice_over</Icon>
                    <MDTypography variant="h6" fontWeight="bold" color="dark">
                      Expression Orale - Distribution par Niveau
                    </MDTypography>
                  </MDBox>
                  <ReportsBarChart
                    color="info"
                    title=""
                    description="Nombre d'examens par niveau CECR"
                    date={dashboardData.loading ? "Chargement..." : "basé sur vos examens"}
                    chart={getOralExpressionBarChartData()}
                  />
                </MDBox>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                borderRadius: 4,
                background: 'linear-gradient(135deg, #10b98115 0%, #10b98105 100%)',
                border: '1px solid #10b98120',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 15px 35px #10b98120'
                }
              }}>
                <MDBox p={3}>
                  <MDBox display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ color: '#10b981', fontSize: '1.5rem', mr: 1 }}>edit</Icon>
                    <MDTypography variant="h6" fontWeight="bold" color="dark">
                      Expression Écrite - Distribution par Niveau
                    </MDTypography>
                  </MDBox>
                  <ReportsBarChart
                    color="success"
                    title=""
                    description="Nombre d'examens par niveau CECR"
                    date={dashboardData.loading ? "Chargement..." : "basé sur vos examens"}
                    chart={getWrittenExpressionBarChartData()}
                  />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>

        {/* Graphique Combiné Expression Orale et Écrite */}
        <MDBox mb={6}>
          <Card sx={{
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
            }
          }}>
            <MDBox p={3}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Icon sx={{ color: '#6366f1', fontSize: '1.5rem', mr: 1 }}>bar_chart</Icon>
                <MDTypography variant="h6" fontWeight="bold" color="dark">
                  Comparaison Expression Orale vs Écrite
                </MDTypography>
              </MDBox>
              <MixedChart
                icon={{ color: "info", component: "bar_chart" }}
                title=""
                description="Distribution comparative des niveaux CECR"
                height="20rem"
                chart={getCombinedExpressionBarChartData()}
              />
            </MDBox>
          </Card>
        </MDBox>

        {/* Légende des niveaux CECR améliorée */}
        {dashboardData.userInfo?.role === 'Client' && (
          <MDBox mb={4}>
            <Card sx={{
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f5f5f515 0%, #f5f5f505 100%)',
              border: '1px solid #e0e0e020'
            }}>
              <MDBox p={3}>
                <MDBox display="flex" alignItems="center" mb={2}>
                  <Icon sx={{ color: '#4f46e5', fontSize: '1.5rem', mr: 1 }}>school</Icon>
                  <MDTypography variant="h6" fontWeight="bold" color="dark">
                    📊 Guide des Niveaux CECR - Analyse Dynamique
                  </MDTypography>
                </MDBox>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#ddd6fe', borderRadius: 2, border: '2px solid #8b5cf6' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#8b5cf6' }}>A1</MDTypography>
                      <MDTypography variant="caption" color="text">Débutant</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>45 pts</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#dcfce7', borderRadius: 2, border: '2px solid #10b981' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#10b981' }}>A2</MDTypography>
                      <MDTypography variant="caption" color="text">Élémentaire</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>55 pts</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#fef3c7', borderRadius: 2, border: '2px solid #f59e0b' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#f59e0b' }}>B1</MDTypography>
                      <MDTypography variant="caption" color="text">Intermédiaire</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>65 pts</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#fce7f3', borderRadius: 2, border: '2px solid #ec4899' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#ec4899' }}>B2</MDTypography>
                      <MDTypography variant="caption" color="text">Avancé</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>75 pts</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#e0e7ff', borderRadius: 2, border: '2px solid #4f46e5' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#4f46e5' }}>C1</MDTypography>
                      <MDTypography variant="caption" color="text">Autonome</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>85 pts</MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2}>
                    <MDBox textAlign="center" p={2} sx={{ backgroundColor: '#f1f5f9', borderRadius: 2, border: '2px solid #64748b' }}>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: '#64748b' }}>C2</MDTypography>
                      <MDTypography variant="caption" color="text">Maîtrise</MDTypography>
                      <MDTypography variant="body2" sx={{ fontSize: '0.7rem', mt: 0.5 }}>95 pts</MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
                <MDBox mt={2}>
                  <MDTypography variant="body2" color="text" sx={{ opacity: 0.8 }}>
                    💡 Les graphiques ci-dessus utilisent des données dynamiques basées sur vos vrais examens et performances
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </MDBox>
        )}

        {/* Section de motivation finale */}
        <MDBox mb={4}>
           <Card sx={{
             borderRadius: 4,
             background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
             color: 'white',
             textAlign: 'center',

           }}>
             <MDBox p={4}>
               <Icon sx={{ fontSize: '3rem !important', mb: 2, opacity: 0.9 }}>emoji_events</Icon>
               <MDTypography variant="h4" fontWeight="bold" mb={2}>
                 Continuez sur cette lancée !
               </MDTypography>
               <MDTypography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
                 Chaque examen vous rapproche de votre objectif TCF Canada.
                 Restez motivé et atteignez l'excellence !
               </MDTypography>
               <MDBox display="flex" justifyContent="center" gap={2}>
                 <MDButton 
                   variant="contained" 
                   color="white" 
                   size="large"
                   onClick={() => navigate('/simulateur-tcf-canada/expression-ecrits')}
                   sx={{ borderRadius: 3, px: 4 }}
                 >
                   Coach Écrit
                 </MDButton>
                 <MDButton 
                   variant="outlined" 
                   color="white" 
                   size="large"
                   onClick={() => navigate('/tcf-simulator/oral')}
                   sx={{ borderRadius: 3, px: 4, borderColor: 'white', color: 'white' }}
                 >
                   Coach Oral
                 </MDButton>
               </MDBox>
             </MDBox>
           </Card>
         </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
